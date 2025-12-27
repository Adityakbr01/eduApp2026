import express from "express";
import mongoose from "mongoose";
import { redis } from "src/configs/redis.js";
import AppError from "src/utils/AppError.js";
import { sendResponse } from "src/utils/sendResponse.js";
import logger from "../utils/logger.js";
import { env } from "src/configs/env.js";
import { API_VERSION } from "src/constants/api.js";

const router = express.Router();

router.get("/", async (_req, res) => {
    const timestamp = new Date().toISOString();

    try {
        // MongoDB check
        const mongoState = mongoose.connection.readyState; // 1 = connected
        const isMongoOkay = mongoState === 1;

        // Redis check (ping)
        let isRedisOkay = false;
        try {
            const pong = await redis.ping();
            isRedisOkay = pong === "PONG";
        } catch (err) {
            logger.error("Redis health check failed:", err);
        }

        // Aggregate status
        const allOkay = isMongoOkay && isRedisOkay;

        if (!allOkay) {
            return res.status(500).json({
                status: "ERROR",
                timestamp,
                details: {
                    mongodb: isMongoOkay ? "OK" : "DOWN",
                    redis: isRedisOkay ? "OK" : "DOWN",
                },
            });
        }

        sendResponse(res, 200, "Healthy", {
            mongodb: "OK",
            redis: "OK",
            environment: env.NODE_ENV,
            version: API_VERSION || "v1",
        });
        return;
    } catch (err) {
        logger.error("Health check failed:", err);
        throw new AppError("Health check failed", 500);
    }
});

export default router;
