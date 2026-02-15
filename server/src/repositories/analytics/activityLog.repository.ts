import mongoose from "mongoose";
import UserActivityLog from "src/models/analytics/userActivityLog.model.js";
import logger from "src/utils/logger.js";

// ============================================
// ACTIVITY LOG REPOSITORY
// ============================================
// Thin wrapper for inserting activity logs.
// Called from BullMQ worker, never from API request cycle.

export const activityLogRepository = {
    /**
     * Insert a single activity log entry
     */
    async log(data: {
        userId: string;
        courseId: string;
        contentId?: string;
        action: "OPEN" | "COMPLETE" | "SUBMIT" | "GRADE";
        metadata?: Record<string, any>;
    }): Promise<void> {
        try {
            await UserActivityLog.create({
                userId: new mongoose.Types.ObjectId(data.userId),
                courseId: new mongoose.Types.ObjectId(data.courseId),
                contentId: data.contentId ? new mongoose.Types.ObjectId(data.contentId) : undefined,
                action: data.action,
                metadata: data.metadata || {},
                timestamp: new Date(),
            });
        } catch (err) {
            logger.error(`[ActivityLog] Failed to log activity: ${data.action}`, err);
        }
    },

    /**
     * Get daily activity counts for heatmap
     */
    async getDailyActivityCounts(userId: string, courseId: string, days: number = 365) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        return UserActivityLog.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    courseId: new mongoose.Types.ObjectId(courseId),
                    timestamp: { $gte: since },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    },
};
