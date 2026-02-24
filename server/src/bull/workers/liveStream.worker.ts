import { Worker, type Job } from "bullmq";
import { JOB_NAMES, QUEUE_NAMES } from "src/bull/config/bullmq.config.js";
import { env } from "src/configs/env.js";
import { bullMQConnection } from "src/configs/redis.js";
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
                logger.error("❌ Missing liveId or recordedVideoId in background job", {
                    jobData: job.data,
                });
                return;
            }

            // The DB update (recordingProcessed: true, LessonContent update) is now executed 
            // SYNCHRONOUSLY inside the webhook (vdocipher.webhook.ts) so users don't have to wait.
            // This worker is strictly for BACKGROUND tasks like Emails or Push Notifications!

            logger.info("ℹ️ Proceeding with Background Tasks (Emails, Notifications) for Recording", {
                liveId,
                recordedVideoId,
            });

            // TODO: Implement email sending to enrolled students about the newly available recording
            // await emailService.sendRecordingAvailableEmail(liveId);

            // TODO: Implement Push Notification dispatch
            // await pushNotificationQueue.add(...)

            logger.info("✅ LiveStream background job (Emails/Notifications) completed successfully", {
                liveId,
                recordedVideoId,
            });
        } catch (error) {
            logger.error("❌ LiveStream Background Worker Failed:", error);
            throw error; // Re-throw so BullMQ retries
        }
    },
    {
        connection: bullMQConnection,
        concurrency: env.BULLMQ_WORKER_CONCURRENCY || 3,
    }
);
