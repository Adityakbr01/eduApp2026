import { Queue } from "bullmq";
import { bullMQConnection } from "src/configs/redis.js";
import { QUEUE_NAMES } from "../config/bullmq.config.js";

export const pushNotificationQueue = new Queue(
    QUEUE_NAMES.PUSH_NOTIFICATION,
    {
        connection: bullMQConnection,
        defaultJobOptions: {
            attempts: 5,
            backoff: { type: "exponential", delay: 5000 },
            removeOnComplete: { age: 3600, count: 1000 },
            removeOnFail: { age: 86400 },
        },
    }
);

export default pushNotificationQueue;