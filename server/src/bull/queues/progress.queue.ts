import { Queue } from "bullmq";
import { bullMQConnection } from "src/configs/redis.js";
import { QUEUE_NAMES } from "../config/bullmq.config.js";

// ============================================
// PROGRESS QUEUE
// ============================================
// Handles background jobs for:
// - Course progress recalculation
// - Leaderboard score updates
// - Activity logging

export const progressQueue = new Queue(QUEUE_NAMES.PROGRESS, {
    connection: bullMQConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false, // Keep for debugging
    },
});
