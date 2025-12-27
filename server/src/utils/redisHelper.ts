import { redis } from "src/configs/redis.js";

export const getCache = async <T>(key: string): Promise<T | null> => {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
};

export const setCache = async (
    key: string,
    value: any,
    ttl = 60
) => {
    // TTL in seconds
    await redis.set(key, JSON.stringify(value), "EX", ttl);
};

export const deleteCache = async (key: string) => {
    await redis.del(key);
};

export const flushAllCache = async () => {
    await redis.flushall();
};
