import { Redis } from "ioredis";
import logger from "src/utils/logger.js";
import { env, isProd } from "./env.js";

// Ensure .env has UPSTASH_REDIS_URL
export const redis = new Redis(isProd ? env.UPSTASH_REDIS_URL : env.REDIS_URL, {
    tls: {},
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times) {
        return Math.min(times * 100, 2000);
    },
});

// BullMQ requires maxRetriesPerRequest to be null
export const bullMQConnection = new Redis(isProd ? env.UPSTASH_REDIS_URL : env.REDIS_URL, {
    tls: {},
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
        return Math.min(times * 100, 2000);
    },
});

redis.on("connect", () => logger.info("🔴 Redis connected"));
redis.on("error", (err) => logger.error("Redis error:", err));

bullMQConnection.on("connect", () => logger.info("🔴 BullMQ Redis connected"));
bullMQConnection.on("error", (err) => logger.error("BullMQ Redis error:", err));
