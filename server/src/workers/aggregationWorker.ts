import type { AnyBulkWriteOperation } from "mongodb";
import { MetricAgg } from "../models/monitoring/MetricAgg.js";
import { MetricRaw } from "../models/monitoring/MetricRaw.js";
import checkErrorRateAndAlert from "../utils/checkErrorRateAndAlert.js";
import logger from "../utils/logger.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const LOG_BATCH_SIZE = 100;
const METRIC_BATCH_SIZE = 100;
const DB_WRITE_CHUNK = 50;       // docs per insertMany / bulkWrite call
const RAW_RETENTION_MS = 24 * 60 * 60 * 1000;
const REDIS_POLL_IDLE_MS = 5_000;    // wait between polls when queues are empty
const REDIS_POLL_DRAIN_MS = 10;       // wait between polls when queues are full
const MINUTE_ALIGN_JITTER = 50;       // ms after :00 to avoid exact boundary races
const HOUR_ALIGN_JITTER = 1_000;

// ─── Internal State ───────────────────────────────────────────────────────────

/** Tracks all pending setTimeout handles so we can cancel on shutdown. */
const timers = new Set<ReturnType<typeof setTimeout>>();

/** Per-worker running flags — structurally prevents overlapping runs. */
const running = {
    aggregation: false,
    cleanup: false,
    redisBatch: false,
};

/** Tracks total processed counts for observability. */
const stats = {
    aggregationRuns: 0,
    metricsInserted: 0,
    logsInserted: 0,
    cleanupRuns: 0,
    rawMetricsDeleted: 0,
};

let isShuttingDown = false;

// ─── Lazy singleton for Redis + Log ──────────────────────────────────────────
// Imported once; reused on every tick. Avoids dynamic-import overhead in the
// hot path and prevents circular-dependency issues at startup.

type RedisDeps = { redis: any; Log: any };
let redisDepsPromise: Promise<RedisDeps> | null = null;

async function getRedisDeps(): Promise<RedisDeps> {
    if (!redisDepsPromise) {
        redisDepsPromise = (async () => {
            const { redis } = await import("../configs/redis.js");
            const { Log } = await import("../models/monitoring/Log.js");
            return { redis, Log };
        })();
    }
    return redisDepsPromise;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Schedules a callback and registers the handle for clean shutdown.
 */
function safeTimeout(fn: () => void, ms: number): void {
    if (isShuttingDown) return;
    const handle = setTimeout(() => {
        timers.delete(handle);
        fn();
    }, ms);
    timers.add(handle);
}

/**
 * Yields to the Node.js event loop so timers / I/O callbacks can fire.
 * Prevents the "missed execution" warning caused by long synchronous chains.
 */
const yieldToEventLoop = (): Promise<void> =>
    new Promise(resolve => setImmediate(resolve));

/**
 * Splits an array into chunks of at most `size` elements.
 */
function chunkArray<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

/**
 * Calculates the p95 value of a latency array without mutating it.
 */
function calcP95(latencies: number[]): number {
    if (latencies.length === 0) return 0;
    const sorted = [...latencies].sort((a, b) => a - b);
    const idx = Math.min(Math.floor(sorted.length * 0.95), sorted.length - 1);
    return sorted[idx];
}

/**
 * Milliseconds until the start of the next aligned minute/hour boundary.
 */
function msUntilNextMinute(jitter = MINUTE_ALIGN_JITTER): number {
    return 60_000 - (Date.now() % 60_000) + jitter;
}

function msUntilNextHour(jitter = HOUR_ALIGN_JITTER): number {
    return 3_600_000 - (Date.now() % 3_600_000) + jitter;
}

/**
 * Safely parses a JSON string; returns null on failure.
 */
function tryParse<T>(raw: string): T | null {
    try { return JSON.parse(raw) as T; } catch { return null; }
}

// ─── Worker 1: Metric Aggregation ─────────────────────────────────────────────
// Fires at the exact start of every minute. Aggregates the just-completed
// 1-minute window from MetricRaw into MetricAgg.

async function runAggregation(): Promise<void> {
    if (running.aggregation) {
        logger.warn("⏭️  Aggregation skipped — previous run still in progress");
        safeTimeout(scheduleAggregation, msUntilNextMinute());
        return;
    }

    running.aggregation = true;
    const start = Date.now();

    try {
        // Snap to exact minute boundary so the window is always clean
        const now = new Date();
        const windowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
        const windowStart = new Date(windowEnd.getTime() - 60_000);

        const rawMetrics = await MetricRaw.aggregate([
            {
                $match: {
                    timestamp: { $gte: windowStart, $lt: windowEnd }
                }
            },
            {
                $group: {
                    _id: { service: "$service", path: "$path" },
                    count: { $sum: 1 },
                    errorCount: { $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] } },
                    totalLatency: { $sum: "$latencyMs" },
                    latencies: { $push: "$latencyMs" },
                }
            }
        ]).allowDiskUse(true); // safety valve for large datasets

        if (rawMetrics.length === 0) {
            logger.debug("📭 Aggregation: no metrics in window");
            return;
        }


        // Build bulk ops, yielding every 20 items to keep the event loop alive
        const bulkOps: AnyBulkWriteOperation<any>[] = [];

        for (let i = 0; i < rawMetrics.length; i++) {
            const { count, errorCount, totalLatency, latencies } = rawMetrics[i];
            const { service, path } = rawMetrics[i]._id;

            bulkOps.push({
                insertOne: {
                    document: {
                        windowStart,
                        windowEnd,
                        windowSize: "1m",
                        service,
                        path,
                        count,
                        errorCount,
                        avgLatencyMs: totalLatency / count,
                        p95LatencyMs: calcP95(latencies),
                        errorRate: (errorCount / count) * 100,
                    }
                }
            });

            if ((i + 1) % 20 === 0) await yieldToEventLoop();
        }

        // Write in capped chunks so no single bulkWrite monopolises the DB connection
        let written = 0;
        for (const chunk of chunkArray(bulkOps, DB_WRITE_CHUNK)) {
            await MetricAgg.bulkWrite(chunk, { ordered: false });
            written += chunk.length;
            await yieldToEventLoop();
        }

        stats.aggregationRuns++;
        stats.metricsInserted += written;
        logger.info(`✅ Aggregation: ${written} groups written in ${Date.now() - start}ms`);

    } catch (error) {
        logger.error("❌ Aggregation failed:", error);
    } finally {
        running.aggregation = false;
        scheduleAggregation();
    }
}

function scheduleAggregation(): void {
    safeTimeout(runAggregation, msUntilNextMinute());
}

// ─── Worker 2: Redis → MongoDB Drain ──────────────────────────────────────────
// Self-adjusting poll rate: drains as fast as possible when queues are full,
// backs off when they are empty.

async function runRedisBatch(): Promise<void> {
    if (running.redisBatch) {
        safeTimeout(runRedisBatch, REDIS_POLL_IDLE_MS);
        return;
    }

    running.redisBatch = true;
    let shouldDrainImmediately = false;

    try {
        const { redis, Log } = await getRedisDeps();

        // ── Logs ──────────────────────────────────────────────────────────────
        const rawLogs = await redis.lpop("monitoring:logs", LOG_BATCH_SIZE);
        let logsInserted = 0;

        if (rawLogs) {
            const parsed = (Array.isArray(rawLogs) ? rawLogs : [rawLogs])
                .map((s: string) => tryParse(s))
                .filter(Boolean);

            for (const chunk of chunkArray(parsed, DB_WRITE_CHUNK)) {
                await Log.insertMany(chunk, { ordered: false });
                logsInserted += chunk.length;
                await yieldToEventLoop();
            }

            stats.logsInserted += logsInserted;
            if (logsInserted >= LOG_BATCH_SIZE) shouldDrainImmediately = true;
        }

        // ── Metrics ───────────────────────────────────────────────────────────
        const rawMetrics = await redis.lpop("monitoring:metrics", METRIC_BATCH_SIZE);
        let metricsInserted = 0;

        if (rawMetrics) {
            const parsed = (Array.isArray(rawMetrics) ? rawMetrics : [rawMetrics])
                .map((s: string) => tryParse(s))
                .filter(Boolean);

            if (parsed.length > 0) {
                for (const chunk of chunkArray(parsed, DB_WRITE_CHUNK)) {
                    await MetricRaw.insertMany(chunk, { ordered: false });
                    metricsInserted += chunk.length;
                    await yieldToEventLoop();
                }

                stats.metricsInserted += metricsInserted;

                // Fire-and-forget: alert check must NOT block ingestion pipeline
                checkErrorRateAndAlert(parsed, redis).catch(err =>
                    logger.error("❌ Alert check failed:", err)
                );

                if (metricsInserted >= METRIC_BATCH_SIZE) shouldDrainImmediately = true;
            }
        }

    } catch (error) {
        logger.error("❌ Redis batch worker failed:", error);
    } finally {
        running.redisBatch = false;

        // Full batch → drain again almost immediately to prevent queue buildup.
        // Empty batch → relax and poll after the normal idle interval.
        safeTimeout(
            runRedisBatch,
            shouldDrainImmediately ? REDIS_POLL_DRAIN_MS : REDIS_POLL_IDLE_MS
        );
    }
}

// ─── Worker 3: Raw Metric Cleanup ─────────────────────────────────────────────
// Deletes raw metrics older than 24 hours. Fires at the top of every hour.

async function runCleanup(): Promise<void> {
    if (running.cleanup) {
        scheduleCleanup();
        return;
    }

    running.cleanup = true;

    try {
        const cutoff = new Date(Date.now() - RAW_RETENTION_MS);
        const result = await MetricRaw.deleteMany({ timestamp: { $lt: cutoff } });

        stats.cleanupRuns++;
        stats.rawMetricsDeleted += result.deletedCount ?? 0;
        logger.info(`🗑️  Cleanup: removed ${result.deletedCount} raw metrics`);

    } catch (error) {
        logger.error("❌ Cleanup failed:", error);
    } finally {
        running.cleanup = false;
        scheduleCleanup();
    }
}

function scheduleCleanup(): void {
    safeTimeout(runCleanup, msUntilNextHour());
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const startAggregationWorker = (): void => {
    if (isShuttingDown) {
        logger.warn("⚠️  Cannot start worker — shutdown already initiated");
        return;
    }

    logger.info("🚀 Starting Aggregation Worker...");

    // Pre-warm Redis + Log so the first Redis tick pays no import cost
    getRedisDeps().catch(err =>
        logger.error("⚠️  Failed to pre-warm Redis/Log:", err)
    );

    scheduleAggregation();                           // fires at next minute :00
    safeTimeout(runRedisBatch, REDIS_POLL_IDLE_MS);  // first Redis poll after 5s
    scheduleCleanup();                               // fires at next full hour

    logger.info("✅ Aggregation Worker started.");
};

/**
 * Gracefully stops all workers.
 * Call this inside your SIGTERM / SIGINT handler before process.exit().
 *
 * @example
 * process.on("SIGTERM", async () => {
 *   stopAggregationWorker();
 *   await mongoose.disconnect();
 *   process.exit(0);
 * });
 */
export const stopAggregationWorker = (): void => {
    logger.info("🛑 Stopping Aggregation Worker...");
    isShuttingDown = true;
    timers.forEach(clearTimeout);
    timers.clear();
    logger.info("✅ Aggregation Worker stopped.");
};

/**
 * Returns a live snapshot of internal counters.
 * Wire this into your /health or /metrics endpoint.
 *
 * @example
 * app.get("/health/workers", (_req, res) => res.json(getWorkerStats()));
 */
export const getWorkerStats = () => ({ ...stats });