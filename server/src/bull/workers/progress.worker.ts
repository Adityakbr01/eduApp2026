import { Worker, Job } from "bullmq";
import { bullMQConnection } from "src/configs/redis.js";
import { QUEUE_NAMES, JOB_NAMES } from "../config/bullmq.config.js";
import { leaderboardRepository } from "src/repositories/classroom/leaderboard.repository.js";
import { courseProgressRepository } from "src/repositories/progress/courseProgress.repository.js";
import { activityLogRepository } from "src/repositories/analytics/activityLog.repository.js";
import logger from "src/utils/logger.js";

// ============================================
// PROGRESS WORKER
// ============================================
// Processes background jobs for:
// - CourseProgress recalculation
// - Leaderboard score updates
// - Activity logging

export const progressWorker = new Worker(
    QUEUE_NAMES.PROGRESS,
    async (job: Job) => {
        const { name, data } = job;

        switch (name) {
            // -------------------- RECALCULATE COURSE PROGRESS --------------------
            case JOB_NAMES.PROGRESS.RECALCULATE_COURSE: {
                const { userId, courseId } = data;
                logger.debug(`[ProgressWorker] Recalculating progress for user=${userId} course=${courseId}`);
                await courseProgressRepository.recalculate(userId, courseId);
                break;
            }

            // -------------------- UPDATE LEADERBOARD SCORE --------------------
            case JOB_NAMES.PROGRESS.UPDATE_LEADERBOARD: {
                const { userId, courseId } = data;
                logger.debug(`[ProgressWorker] Updating leaderboard for user=${userId} course=${courseId}`);
                await leaderboardRepository.recalculateUserScore(courseId, userId);
                break;
            }

            // -------------------- REBUILD LEADERBOARD --------------------
            case JOB_NAMES.PROGRESS.REBUILD_LEADERBOARD: {
                const { courseId } = data;
                logger.info(`[ProgressWorker] Full leaderboard rebuild for course=${courseId}`);
                await leaderboardRepository.rebuildFromMongo(courseId);
                break;
            }

            // -------------------- LOG ACTIVITY --------------------
            case JOB_NAMES.PROGRESS.LOG_ACTIVITY: {
                await activityLogRepository.log(data);
                break;
            }

            default:
                logger.warn(`[ProgressWorker] Unknown job: ${name}`);
        }
    },
    {
        connection: bullMQConnection,
        concurrency: 5, // Process up to 5 jobs concurrently
        limiter: {
            max: 100,
            duration: 1000, // Max 100 jobs per second
        },
    }
);

progressWorker.on("completed", (job) => {
    logger.debug(`[ProgressWorker] ✅ Job completed: ${job.name} (${job.id})`);
});

progressWorker.on("failed", (job, err) => {
    logger.error(`[ProgressWorker] ❌ Job failed: ${job?.name} (${job?.id})`, err);
});

progressWorker.on("error", (err) => {
    logger.error("[ProgressWorker] ❌ Worker error", err);
});
