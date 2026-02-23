import { Worker, Job } from "bullmq";
import { bullMQConnection } from "src/configs/redis.js";
import { QUEUE_NAMES, JOB_NAMES } from "../config/bullmq.config.js";
import reviewAggregationProcessor from "../processors/aggregation/reviewAggregationProcessor.js";
import logger from "src/utils/logger.js";

// ============================================
// AGGREGATION WORKER
// ============================================
// Processes background jobs for data aggregations

const aggregationWorker = new Worker(
    QUEUE_NAMES.REVIEW_AGGREGATION,
    async (job: Job) => {
        const { name } = job;

        switch (name) {
            case JOB_NAMES.REVIEW_AGGREGATION.REVIEW_STATS:
                return reviewAggregationProcessor(job);

            default:
                logger.warn(`[AggregationWorker] Unknown job type: ${name}`);
        }
    },
    {
        connection: bullMQConnection,
        concurrency: 2, // Aggregations can be heavy, keep concurrency low
        limiter: {
            max: 50,
            duration: 1000,
        },
    }
);

aggregationWorker.on("completed", (job) => {
    logger.debug(`[AggregationWorker] ✅ Job completed: ${job.name} (${job.id})`);
});

aggregationWorker.on("failed", (job, err) => {
    logger.error(`[AggregationWorker] ❌ Job failed: ${job?.name} (${job?.id})`, err);
});

export default aggregationWorker;
