import type { Job } from "bullmq";
import mongoose from "mongoose";
import CourseReview from "src/models/course/courseReview.model.js";
import Course from "src/models/course/course.model.js";
import logger from "src/utils/logger.js";

export interface ReviewAggregationJobData {
    courseId: string;
}

/**
 * Recalculates course review statistics and updates the Course model.
 * This runs in the background via BullMQ.
 */
export const reviewAggregationProcessor = async (job: Job<ReviewAggregationJobData>) => {
    const { courseId } = job.data;

    if (!courseId) {
        throw new Error("Course ID is required for review aggregation");
    }

    try {
        logger.debug(`[AggregationWorker] Recalculating stats for course: ${courseId}`);

        // 1. Run aggregation using the static method on CourseReview model
        // Note: We use the same logic that was previously in the post-save hook
        const summary = await (CourseReview as any).getCourseRatingSummary(courseId);

        // 2. Update the Course model with new statistics
        await Course.findByIdAndUpdate(courseId, {
            $set: {
                "ratingStats.averageRating": summary.averageRating,
                "ratingStats.totalReviews": summary.totalReviews,
                "ratingStats.ratingsDistribution": summary.ratingsDistribution,
            }
        });

        logger.info(`[AggregationWorker] Successfully updated stats for course: ${courseId}`, {
            averageRating: summary.averageRating,
            totalReviews: summary.totalReviews
        });

        return { success: true, courseId, summary };
    } catch (error) {
        logger.error(`[AggregationWorker] Failed to aggregate reviews for course: ${courseId}`, error);
        throw error;
    }
};

export default reviewAggregationProcessor;
