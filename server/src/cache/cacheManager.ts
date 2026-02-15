import { redis as redisClient } from "src/configs/redis.js";
import logger from "src/utils/logger.js";

// =====================
// CACHE MANAGER CLASS
// =====================

class CacheManager {
    // =====================
    // BASIC OPERATIONS
    // =====================

    /**
     * Set a key-value pair in cache
     */
    async set(key: string, value: any, ttl?: number): Promise<string | null> {
        try {
            const data = JSON.stringify(value);
            const result = ttl
                ? await redisClient.set(key, data, "EX", ttl)
                : await redisClient.set(key, data);
            return result;
        } catch (err) {
            logger.error(`❌ Cache SET error | key=${key}`, err);
            throw err;
        }
    }

    /**
     * Get a value from cache
     */
    async get<T = any>(key: string): Promise<T | null> {
        try {
            const raw = await redisClient.get(key);
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            logger.error(`❌ Cache GET error | key=${key}`, err);
            return null;
        }
    }

    /**
     * Delete a key from cache
     */
    async del(key: string): Promise<number> {
        try {
            const result = await redisClient.del(key);
            return result;
        } catch (err) {
            logger.error(`❌ Cache DEL error | key=${key}`, err);
            return 0;
        }
    }

    /**
     * Delete keys matching a pattern
     */
    async delPattern(pattern: string): Promise<number> {
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                const result = await redisClient.del(...keys);
                return result;
            }
            return 0;
        } catch (err) {
            logger.error(`❌ Cache DEL PATTERN error | pattern=${pattern}`, err);
            return 0;
        }
    }

    // =====================
    // BATCH OPERATIONS
    // =====================

    /**
     * Get multiple keys at once
     */
    async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
        if (keys.length === 0) return [];

        try {
            const results = await redisClient.mget(...keys);
            return results.map((raw) => (raw ? JSON.parse(raw) : null));
        } catch (err) {
            logger.error(`❌ Cache MGET error | keys=${keys.length}`, err);
            return keys.map(() => null);
        }
    }

    /**
     * Set multiple key-value pairs at once
     */
    async mset(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<boolean> {
        if (entries.length === 0) return true;

        try {
            const pipeline = redisClient.pipeline();

            for (const { key, value, ttl } of entries) {
                const data = JSON.stringify(value);
                if (ttl) {
                    pipeline.set(key, data, "EX", ttl);
                } else {
                    pipeline.set(key, data);
                }
            }

            await pipeline.exec();
            return true;
        } catch (err) {
            logger.error(`❌ Cache MSET error | entries=${entries.length}`, err);
            return false;
        }
    }

    /**
     * Delete multiple keys at once
     */
    async mdel(keys: string[]): Promise<number> {
        if (keys.length === 0) return 0;

        try {
            const result = await redisClient.del(...keys);
            return result;
        } catch (err) {
            logger.error(`❌ Cache MDEL error | keys=${keys.length}`, err);
            return 0;
        }
    }

    // =====================
    // HASH OPERATIONS
    // =====================

    /**
     * Set a hash field
     */
    async hset(key: string, field: string, value: any): Promise<number> {
        try {
            const data = JSON.stringify(value);
            return await redisClient.hset(key, field, data);
        } catch (err) {
            logger.error(`❌ Cache HSET error | key=${key} field=${field}`, err);
            return 0;
        }
    }

    /**
     * Get a hash field
     */
    async hget<T = any>(key: string, field: string): Promise<T | null> {
        try {
            const raw = await redisClient.hget(key, field);
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            logger.error(`❌ Cache HGET error | key=${key} field=${field}`, err);
            return null;
        }
    }

    /**
     * Get all hash fields
     */
    async hgetall<T = any>(key: string): Promise<Record<string, T> | null> {
        try {
            const raw = await redisClient.hgetall(key);
            if (!raw || Object.keys(raw).length === 0) return null;

            const result: Record<string, T> = {};
            for (const [field, value] of Object.entries(raw)) {
                result[field] = JSON.parse(value);
            }
            return result;
        } catch (err) {
            logger.error(`❌ Cache HGETALL error | key=${key}`, err);
            return null;
        }
    }

    /**
     * Delete hash fields
     */
    async hdel(key: string, ...fields: string[]): Promise<number> {
        try {
            return await redisClient.hdel(key, ...fields);
        } catch (err) {
            logger.error(`❌ Cache HDEL error | key=${key}`, err);
            return 0;
        }
    }

    // =====================
    // TTL OPERATIONS
    // =====================

    /**
     * Set expiry on existing key
     */
    async expire(key: string, ttl: number): Promise<boolean> {
        try {
            const result = await redisClient.expire(key, ttl);
            return result === 1;
        } catch (err) {
            logger.error(`❌ Cache EXPIRE error | key=${key}`, err);
            return false;
        }
    }

    /**
     * Get remaining TTL for a key
     */
    async ttl(key: string): Promise<number> {
        try {
            return await redisClient.ttl(key);
        } catch (err) {
            logger.error(`❌ Cache TTL error | key=${key}`, err);
            return -2;
        }
    }

    // =====================
    // ATOMIC OPERATIONS
    // =====================

    /**
     * Set only if key doesn't exist (for locks)
     */
    async setnx(key: string, value: any, ttl?: number): Promise<boolean> {
        try {
            const data = JSON.stringify(value);
            const result = ttl
                ? await redisClient.set(key, data, "EX", ttl, "NX")
                : await redisClient.setnx(key, data);

            return result === "OK" || result === 1;
        } catch (err) {
            logger.error(`❌ Cache SETNX error | key=${key}`, err);
            return false;
        }
    }

    /**
     * Increment a numeric value
     */
    async incr(key: string): Promise<number> {
        try {
            return await redisClient.incr(key);
        } catch (err) {
            logger.error(`❌ Cache INCR error | key=${key}`, err);
            return 0;
        }
    }

    /**
     * Increment by a specific amount
     */
    async incrby(key: string, amount: number): Promise<number> {
        try {
            return await redisClient.incrby(key, amount);
        } catch (err) {
            logger.error(`❌ Cache INCRBY error | key=${key}`, err);
            return 0;
        }
    }

    // =====================
    // UTILITY OPERATIONS
    // =====================

    /**
     * Check if key exists
     */
    async exists(key: string): Promise<boolean> {
        try {
            const result = await redisClient.exists(key);
            return result === 1;
        } catch (err) {
            logger.error(`❌ Cache EXISTS error | key=${key}`, err);
            return false;
        }
    }

    /**
     * Get all keys matching a pattern
     */
    async keys(pattern: string): Promise<string[]> {
        try {
            return await redisClient.keys(pattern);
        } catch (err) {
            logger.error(`❌ Cache KEYS error | pattern=${pattern}`, err);
            return [];
        }
    }

    /**
     * Flush all cache (use with caution!)
     */
    async flushAll(): Promise<void> {
        try {
            await redisClient.flushall();
            logger.warn("⚠️ Cache FLUSHALL executed");
        } catch (err) {
            logger.error("❌ Cache FLUSHALL error", err);
        }
    }

    /**
     * Get or Set cache pattern
     */
    async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<{ data: T; isCached: boolean }> {
        try {
            const cached = await this.get<T>(key);
            if (cached) {
                return { data: cached, isCached: true };
            }

            const data = await fetcher();
            if (data) {
                await this.set(key, data, ttl);
            }
            return { data, isCached: false };
        } catch (err) {
            logger.error(`❌ Cache GETORSET error | key=${key}`, err);
            // Fallback to fetcher if cache check fails
            const data = await fetcher();
            return { data, isCached: false };
        }
    }

    // =====================
    // SORTED SET OPERATIONS
    // =====================

    /**
     * Add a member with score to a sorted set
     */
    async zadd(key: string, score: number, member: string): Promise<number> {
        try {
            return await redisClient.zadd(key, score, member);
        } catch (err) {
            logger.error(`❌ Cache ZADD error | key=${key}`, err);
            return 0;
        }
    }

    /**
     * Increment a member's score in a sorted set
     */
    async zincrby(key: string, increment: number, member: string): Promise<string> {
        try {
            return await redisClient.zincrby(key, increment, member);
        } catch (err) {
            logger.error(`❌ Cache ZINCRBY error | key=${key}`, err);
            return "0";
        }
    }

    /**
     * Get members from sorted set in reverse order (highest score first)
     */
    async zrevrangeWithScores(key: string, start: number, stop: number): Promise<{ member: string; score: number }[]> {
        try {
            const results = await redisClient.zrevrange(key, start, stop, "WITHSCORES");
            const entries: { member: string; score: number }[] = [];
            for (let i = 0; i < results.length; i += 2) {
                entries.push({ member: results[i], score: parseFloat(results[i + 1]) });
            }
            return entries;
        } catch (err) {
            logger.error(`❌ Cache ZREVRANGE error | key=${key}`, err);
            return [];
        }
    }

    /**
     * Get a member's rank in reverse order (0 = highest score)
     */
    async zrevrank(key: string, member: string): Promise<number | null> {
        try {
            return await redisClient.zrevrank(key, member);
        } catch (err) {
            logger.error(`❌ Cache ZREVRANK error | key=${key}`, err);
            return null;
        }
    }

    /**
     * Get a member's score in a sorted set
     */
    async zscore(key: string, member: string): Promise<number | null> {
        try {
            const score = await redisClient.zscore(key, member);
            return score !== null ? parseFloat(score) : null;
        } catch (err) {
            logger.error(`❌ Cache ZSCORE error | key=${key}`, err);
            return null;
        }
    }

    /**
     * Get the number of members in a sorted set
     */
    async zcard(key: string): Promise<number> {
        try {
            return await redisClient.zcard(key);
        } catch (err) {
            logger.error(`❌ Cache ZCARD error | key=${key}`, err);
            return 0;
        }
    }

    /**
     * Remove a member from a sorted set
     */
    async zrem(key: string, member: string): Promise<number> {
        try {
            return await redisClient.zrem(key, member);
        } catch (err) {
            logger.error(`❌ Cache ZREM error | key=${key}`, err);
            return 0;
        }
    }

    // =====================
    // HEALTH & MONITORING
    // =====================

    /**
     * Ping Redis to check connectivity
     */
    async ping(): Promise<boolean> {
        try {
            const result = await redisClient.ping();
            return result === "PONG";
        } catch (err) {
            logger.error("❌ Cache PING error", err);
            return false;
        }
    }

    /**
     * Get Redis info
     */
    async info(): Promise<string | null> {
        try {
            return await redisClient.info();
        } catch (err) {
            logger.error("❌ Cache INFO error", err);
            return null;
        }
    }

    /**
     * Get database size (number of keys)
     */
    async dbsize(): Promise<number> {
        try {
            return await redisClient.dbsize();
        } catch (err) {
            logger.error("❌ Cache DBSIZE error", err);
            return 0;
        }
    }
}

export default new CacheManager();
