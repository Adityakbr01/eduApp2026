import { Queue } from "bullmq";
import { bullMQConnection } from "src/configs/redis.js";
import { QUEUE_NAMES } from "../config/bullmq.config.js";

// ============================================
// AGGREGATION QUEUE
// ============================================
// Handles background jobs for:
// - Course review rating aggregation
// - Other heavy data aggregations

export const reviewAggregationQueue = new Queue(QUEUE_NAMES.REVIEW_AGGREGATION, {
    connection: bullMQConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});
