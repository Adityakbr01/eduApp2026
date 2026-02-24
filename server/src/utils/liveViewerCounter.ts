import { redis } from "src/configs/redis.js";
import logger from "src/utils/logger.js";

const VIEWER_KEY_PREFIX = "live:viewers:";
const VIEWER_TTL = 86400; // 24 hours auto-expiry for safety

/**
 * Increment viewer count for a live stream
 */
export const incrementViewerCount = async (liveId: string): Promise<number> => {
    const key = `${VIEWER_KEY_PREFIX}${liveId}`;
    const count = await redis.incr(key);
    await redis.expire(key, VIEWER_TTL);
    return count;
};

/**
 * Decrement viewer count for a live stream (floors at 0)
 */
export const decrementViewerCount = async (liveId: string): Promise<number> => {
    const key = `${VIEWER_KEY_PREFIX}${liveId}`;
    const current = await redis.get(key);
    const currentCount = parseInt(current || "0", 10);

    if (currentCount <= 0) {
        return 0;
    }

    const newCount = await redis.decr(key);
    return Math.max(newCount, 0);
};

/**
 * Get current viewer count for a live stream
 */
export const getViewerCount = async (liveId: string): Promise<number> => {
    const key = `${VIEWER_KEY_PREFIX}${liveId}`;
    const count = await redis.get(key);
    return parseInt(count || "0", 10);
};

/**
 * Clear viewer count for a live stream (called when stream ends)
 */
export const clearViewerCount = async (liveId: string): Promise<void> => {
    const key = `${VIEWER_KEY_PREFIX}${liveId}`;
    await redis.del(key);
    logger.info("🧹 Viewer count cleared", { liveId });
};
