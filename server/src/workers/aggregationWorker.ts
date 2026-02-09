import cron from "node-cron";
import { MetricRaw } from "../models/monitoring/MetricRaw.js";
import { MetricAgg } from "../models/monitoring/MetricAgg.js";
import logger from "../utils/logger.js";
import checkErrorRateAndAlert from "src/utils/checkErrorRateAndAlert.js";

/**
 * Aggregates raw metrics into 1-minute buckets
 * Runs every minute
 */
export const startAggregationWorker = () => {
    logger.info("Starting Aggregation Worker...");

    // Schedule task to run every minute
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

            // Define the window we are aggregating (the minute that just passed)
            // e.g., if now is 10:01:00, we aggregate 10:00:00 to 10:01:00

            // Find raw metrics in this window (or older, not yet aggregated - for robustness we could mark processed)
            // For simplicity, we just aggregate what's there and maybe deleting raw is a separate cleanup task
            // Here we'll just look at the last minute window.

            const rawMetrics = await MetricRaw.aggregate([
                {
                    $match: {
                        timestamp: {
                            $gte: oneMinuteAgo,
                            $lt: now
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            service: "$service",
                            path: "$path"
                        },
                        count: { $sum: 1 },
                        errorCount: {
                            $sum: {
                                $cond: [{ $gte: ["$statusCode", 400] }, 1, 0]
                            }
                        },
                        totalLatency: { $sum: "$latencyMs" },
                        latencies: { $push: "$latencyMs" }
                    }
                }
            ]);

            if (rawMetrics.length === 0) return;

            const bulkOps = rawMetrics.map(metric => {
                const { count, errorCount, totalLatency, latencies } = metric;
                const { service, path } = metric._id;

                const avgLatencyMs = totalLatency / count;
                const errorRate = (errorCount / count) * 100;

                // Calculate p95
                latencies.sort((a: number, b: number) => a - b);
                const p95Index = Math.floor(latencies.length * 0.95);
                const p95LatencyMs = latencies[p95Index];

                return {
                    insertOne: {
                        document: {
                            windowStart: oneMinuteAgo,
                            windowSize: "1m",
                            service,
                            path,
                            count,
                            errorCount,
                            avgLatencyMs,
                            p95LatencyMs,
                            errorRate
                        }
                    }
                };
            });

            if (bulkOps.length > 0) {
                await MetricAgg.bulkWrite(bulkOps);
                logger.info(`✅ Aggregated ${bulkOps.length} metric buckets.`);
            }

        } catch (error) {
            logger.error("❌ Aggregation failed:", error);
        }
    });

    // Optional: Cleanup old raw metrics every hour (keep last 24h)
    cron.schedule("0 * * * *", async () => {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await MetricRaw.deleteMany({ timestamp: { $lt: twentyFourHoursAgo } });
        logger.info("🗑️  Cleaned up old raw metrics.");
    });

    // ---------------------------------------------------------
    // REDIS BATCH PROCESSING WORKER (Runs every 5 seconds)
    // ---------------------------------------------------------
    // ---------------------------------------------------------
    // REDIS BATCH PROCESSING WORKER (Runs every 5 seconds)
    // ---------------------------------------------------------
    cron.schedule("*/5 * * * * *", async () => {
        try {
            // Lazy load dependencies to avoid circular deps during startup if any
            const { redis } = await import("../configs/redis.js");
            const { Log } = await import("../models/monitoring/Log.js");

            // --- PROCESS LOGS ---
            const logBatchSize = 100;
            const logsData = await redis.lpop("monitoring:logs", logBatchSize);

            if (logsData) {
                const logsToInsert = (Array.isArray(logsData) ? logsData : [logsData])
                    .map((item: string) => {
                        try { return JSON.parse(item); } catch (e) { return null; }
                    })
                    .filter((item: any) => item !== null);

                if (logsToInsert.length > 0) {
                    await Log.insertMany(logsToInsert);
                }
            }

            // --- PROCESS METRICS ---
            const metricBatchSize = 100;
            const metricsData = await redis.lpop("monitoring:metrics", metricBatchSize);

            if (metricsData) {
                const metricsToInsert = (Array.isArray(metricsData) ? metricsData : [metricsData])
                    .map((item: string) => {
                        try { return JSON.parse(item); } catch (e) { return null; }
                    })
                    .filter((item: any) => item !== null);

                if (metricsToInsert.length > 0) {
                    await MetricRaw.insertMany(metricsToInsert);

                    // Trigger Alert Check
                    await checkErrorRateAndAlert(metricsToInsert, redis);
                }
            }

        } catch (error) {
            logger.error("❌ Redis Batch Worker Critical Failure:", error);
        }
    });
};

