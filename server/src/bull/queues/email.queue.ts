import { Queue } from "bullmq";
import { bullMQConnection } from "src/configs/redis.js";

export const EMAIL_QUEUE_NAME = "email-queue";

export const defaultJobOptions = {
    attempts: 5,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: true,
    removeOnFail: false, // Important for DLQ
}

const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
    connection: bullMQConnection,
    defaultJobOptions,
});
export default emailQueue;