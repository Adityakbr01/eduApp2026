import { Queue } from "bullmq";
import { bullMQConnection } from "src/configs/redis.js";
import { QUEUE_NAMES } from "src/bull/config/bullmq.config.js";

export const liveStreamJobOptions = {
    attempts: 3,
    backoff: { type: "exponential" as const, delay: 3000 },
    removeOnComplete: true,
    removeOnFail: false,
};

const liveStreamQueue = new Queue(QUEUE_NAMES.LIVE_STREAM, {
    connection: bullMQConnection,
    defaultJobOptions: liveStreamJobOptions,
});

export default liveStreamQueue;
