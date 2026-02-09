import type { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { Log } from "../models/monitoring/Log.js";
import { MetricRaw } from "../models/monitoring/MetricRaw.js";

// Extend Request interface to include traceId
declare global {
    namespace Express {
        interface Request {
            traceId?: string;
        }
    }
}

export const monitorMiddleware = (serviceName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const start = Date.now();
        const traceId = (req.headers["x-trace-id"] as string) || uuidv4();
        req.traceId = traceId;
        res.setHeader("x-trace-id", traceId);

        // Capture response finish
        res.on("finish", async () => {
            try {
                const latencyMs = Date.now() - start;
                const statusCode = res.statusCode;
                const method = req.method;
                const path = req.path; // or req.originalUrl if you want full path

                // Skip monitoring for health checks or monitoring endpoints themselves to avoid loops
                if (path.startsWith("/api/v1/monitoring")) return;

                // 1. Log the request - Push to Redis Queue for Batch Processing
                const logData = {
                    service: serviceName,
                    env: process.env.NODE_ENV || 'development',
                    method,
                    path,
                    statusCode,
                    latencyMs,
                    traceId,
                    level: statusCode >= 400 ? 'error' : 'info',
                    message: `${method} ${path} ${statusCode}`,
                    timestamp: new Date()
                };

                // Import redis lazily or strict
                const { redis } = await import("../configs/redis.js");
                await redis.rpush("monitoring:logs", JSON.stringify(logData));

                // Emit live log (Keep for real-time dashboard)
                const { emitLog } = await import("../Socket/socket.js");
                emitLog(logData);

                // 2. Record raw metric - Push to Redis Queue
                const metricData = {
                    service: serviceName,
                    path,
                    statusCode,
                    latencyMs,
                    timestamp: new Date()
                };
                await redis.rpush("monitoring:metrics", JSON.stringify(metricData));

            } catch (error) {
                console.error("Monitoring Error:", error);
            }
        });

        next();
    };
};
