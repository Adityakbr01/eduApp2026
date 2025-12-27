import { redis as redisClient } from "src/configs/redis.js";
import logger from "src/utils/logger.js";

class CacheManager {
    async set(key: string, value: any, ttl?: number) {
        try {
            const data = JSON.stringify(value);
            ttl
                ? await redisClient.set(key, data, "EX", ttl)
                : await redisClient.set(key, data);
        } catch (err) {
            logger.error("Cache SET error:", err);
        }
    }

    async get(key: string) {
        try {
            const raw = await redisClient.get(key);
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            logger.error("Cache GET error:", err);
            return null;
        }
    }

    async del(key: string) {
        try {
            await redisClient.del(key);
        } catch (err) {
            logger.error("Cache DEL error:", err);
        }
    }

    async delPattern(pattern: string) {
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) await redisClient.del(keys);
        } catch (err) {
            logger.error("Cache DEL PATTERN error:", err);
        }
    }
}

export default new CacheManager();
