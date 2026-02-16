import { Queue } from "bullmq";
import { bullMQConnection } from "src/configs/redis.js";

export const NOTIFICATION_QUEUE_NAME = "notification-queue";

export const notificationJobOptions = {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
};

const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
    connection: bullMQConnection,
    defaultJobOptions: notificationJobOptions,
});

export default notificationQueue;
