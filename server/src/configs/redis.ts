import { Redis } from "ioredis";
import logger from "src/utils/logger.js";
import { env, isProd } from "./env.js";

// Dev me Upstash (cloud Redis) use karega
// Prod me local Docker Redis use karega (hardcoded)
const redisUrl = isProd ? "redis://redis:6379" : env.UPSTASH_REDIS_URL;

// Regular Redis client
export const redis = new Redis(redisUrl!, {
  // tls: isProd ? undefined : {},  // Prod: no TLS (local), Dev: TLS (Upstash)
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    return Math.min(times * 100, 2000);
  },
});

// BullMQ connection
export const bullMQConnection = new Redis(redisUrl!, {
  // tls: isProd ? undefined : {},
  maxRetriesPerRequest: null,
  enableReadyCheck: !isProd,
  retryStrategy(times) {
    return Math.min(times * 100, 2000);
  },
});

redis.on("connect", () =>
  logger.info(`🔴 Redis connected (${isProd ? "Local Docker Redis (Prod)" : "Upstash (Dev)"})`)
);
redis.on("error", (err) => logger.error("Redis error:", err));

bullMQConnection.on("connect", () =>
  logger.info(`🔴 BullMQ Redis connected (${isProd ? "Local Docker Redis (Prod)" : "Upstash (Dev)"})`)
);
bullMQConnection.on("error", (err) => logger.error("BullMQ Redis error:", err));