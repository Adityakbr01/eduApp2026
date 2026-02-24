import { Worker, type Job } from "bullmq";
import { env } from "src/configs/env.js";
import { bullMQConnection } from "src/configs/redis.js";
import { QUEUE_NAMES, JOB_NAMES } from "src/bull/config/bullmq.config.js";
import { liveStreamService } from "src/services/liveStream/liveStream.service.js";
import logger from "src/utils/logger.js";

// ==================== JOB PAYLOAD ====================
export interface LiveStreamJobPayload {
    liveId: string;
    recordedVideoId: string;
}

// ==================== WORKER ====================
export const liveStreamWorker = new Worker(
    QUEUE_NAMES.LIVE_STREAM,
    async (job: Job<LiveStreamJobPayload>) => {
        logger.info(`[LiveStreamWorker] Processing job: ${job.name} (ID: ${job.id})`);

        if (job.name !== JOB_NAMES.LIVE_STREAM.CREATE_RECORDING_CONTENT) {
            logger.warn(`[LiveStreamWorker] Unknown job name: ${job.name}`);
            return;
        }

        try {
            const { liveId, recordedVideoId } = job.data;

            if (!liveId || !recordedVideoId) {
                logger.error("❌ Missing liveId or recordedVideoId in job data", {
                    jobData: job.data,
                });
                return;
            }

            await liveStreamService.createRecordingLessonContent(
                liveId,
                recordedVideoId
            );

            logger.info("✅ LiveStream recording content job completed", {
                liveId,
                recordedVideoId,
            });
        } catch (error) {
            logger.error("❌ LiveStream Worker Failed:", error);
            throw error; // Re-throw so BullMQ retries
        }
    },
    {
        connection: bullMQConnection,
        concurrency: env.BULLMQ_WORKER_CONCURRENCY || 3,
    }
);
