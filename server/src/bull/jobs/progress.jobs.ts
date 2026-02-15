import { JOB_NAMES } from "../config/bullmq.config.js";
import { progressQueue } from "../queues/progress.queue.js";

// ============================================
// PROGRESS JOB PRODUCERS
// ============================================
// Clean API for enqueuing progress-related jobs.
// Called by domain event handlers.

interface RecalculateProgressData {
    userId: string;
    courseId: string;
    lessonId: string;
    contentId: string;
    obtainedMarks: number;
    totalMarks: number;
}

interface UpdateLeaderboardData {
    userId: string;
    courseId: string;
}

interface RebuildLeaderboardData {
    courseId: string;
}

interface LogActivityData {
    userId: string;
    courseId: string;
    contentId?: string;
    action: "OPEN" | "COMPLETE" | "SUBMIT" | "GRADE";
    metadata?: Record<string, any>;
}

export const addProgressJob = {
    /**
     * Recalculate CourseProgress document for a user
     * Debounced: if same user+course job exists, skip duplicate
     */
    recalculateCourseProgress: async (data: RecalculateProgressData) => {
        const jobId = `recalc:${data.userId}:${data.courseId}`;
        await progressQueue.add(JOB_NAMES.PROGRESS.RECALCULATE_COURSE, data, {
            jobId,
            // Deduplicate: if same job is already queued, don't add another
            // BullMQ uses jobId for dedup — same jobId = same job
        });
    },

    /**
     * Update user's score in Redis leaderboard sorted set
     */
    updateLeaderboardScore: async (data: UpdateLeaderboardData) => {
        const jobId = `leaderboard:${data.userId}:${data.courseId}`;
        await progressQueue.add(JOB_NAMES.PROGRESS.UPDATE_LEADERBOARD, data, {
            jobId,
        });
    },

    /**
     * Full rebuild of leaderboard from MongoDB (admin/cron triggered)
     */
    rebuildLeaderboard: async (data: RebuildLeaderboardData) => {
        await progressQueue.add(JOB_NAMES.PROGRESS.REBUILD_LEADERBOARD, data, {
            priority: 10, // Low priority — doesn't block user
        });
    },

    /**
     * Log user activity (async, non-blocking)
     */
    logActivity: async (data: LogActivityData) => {
        await progressQueue.add(JOB_NAMES.PROGRESS.LOG_ACTIVITY, data, {
            removeOnComplete: true,
        });
    },
};
