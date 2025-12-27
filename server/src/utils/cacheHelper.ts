import cache from "src/configs/cache.js";

export const getCache = <T>(key: string): T | undefined => {
    return cache.get<T>(key);
};

export const setCache = <T>(
    key: string,
    value: T,
    ttl = 60
) => {
    cache.set(key, value, ttl);
};

export const deleteCache = (key: string) => {
    cache.del(key);
};

export const flushCache = () => {
    cache.flushAll();
};
