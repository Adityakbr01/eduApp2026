import { ReviewStatus } from "../models/course/courseReview.model.js";
import { reviewRepository } from "../repositories/review.repository.js";
import { enrollmentRepository } from "../repositories/enrollment.repository.js";
import { courseRepository } from "../repositories/course.repository.js";
import AppError from "src/utils/AppError.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";

// ============================================
// INTERFACES
// ============================================
interface CreateReviewData {
    courseId: string;
    userId: string;
    rating: number;
    title?: string;
    content: string;
}

interface UpdateReviewData {
    rating?: number;
    title?: string;
    content?: string;
}

// ============================================
// REVIEW SERVICE
// ============================================
export const reviewService = {
    /**
     * Create a new review
     * User must be enrolled in the course
     */
    createReview: async (data: CreateReviewData) => {
        const { courseId, userId, rating, title, content } = data;

        // Check if course exists
        const course = await courseRepository.findPublishedById(courseId);
        if (!course) {
            throw new AppError("Course not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Check if user is enrolled in the course
        const enrollment = await enrollmentRepository.findByUserAndCourse(userId, courseId);
        if (!enrollment) {
            throw new AppError(
                "You must be enrolled in this course to leave a review",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        // Check if user already reviewed this course
        const existingReview = await reviewRepository.findUserReview(courseId, userId);
        if (existingReview) {
            throw new AppError(
                "You have already reviewed this course. You can edit your existing review.",
                STATUSCODE.CONFLICT,
                ERROR_CODE.DUPLICATE_ENTRY
            );
        }

        // Create the review
        const review = await reviewRepository.create({
            course: courseId,
            user: userId,
            enrollment: enrollment._id.toString(),
            rating,
            title,
            content,
            isVerifiedPurchase: true, // Since enrollment is verified
            courseCompletionPercentage: 0, // TODO: Calculate from progress tracking when available
        });

        return {
            message: "Review submitted successfully",
            review,
        };
    },

    /**
     * Get reviews for a course
     */
    getCourseReviews: async (
        courseId: string,
        options: {
            page?: number;
            limit?: number;
            sortBy?: "recent" | "helpful" | "rating_high" | "rating_low";
        } = {}
    ) => {
        // Verify course exists
        const course = await courseRepository.findPublishedById(courseId);
        if (!course) {
            throw new AppError("Course not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const reviews = await reviewRepository.findByCourse(courseId, {
            ...options,
            status: ReviewStatus.APPROVED,
        });

        // Get rating summary
        const ratingSummary = await reviewRepository.getCourseRatingSummary(courseId);

        return {
            ...reviews,
            ratingSummary,
        };
    },

    /**
     * Get user's review for a course
     */
    getUserReview: async (courseId: string, userId: string) => {
        const review = await reviewRepository.findUserReview(courseId, userId);
        return { review };
    },

    /**
     * Update a review
     */
    updateReview: async (reviewId: string, userId: string, data: UpdateReviewData) => {
        const review = await reviewRepository.update(reviewId, userId, data);

        if (!review) {
            throw new AppError(
                "Review not found or you don't have permission to edit it",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        return {
            message: "Review updated successfully",
            review,
        };
    },

    /**
     * Delete a review
     */
    deleteReview: async (reviewId: string, userId: string) => {
        const review = await reviewRepository.softDelete(reviewId, userId);

        if (!review) {
            throw new AppError(
                "Review not found or you don't have permission to delete it",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        return {
            message: "Review deleted successfully",
        };
    },

    /**
     * Vote on a review
     */
    voteReview: async (reviewId: string, userId: string, voteType: "helpful" | "not_helpful") => {
        // Can't vote on own review
        const review = await reviewRepository.findById(reviewId);
        if (!review) {
            throw new AppError("Review not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        if (review.user._id.toString() === userId) {
            throw new AppError(
                "You cannot vote on your own review",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        const updatedReview = await reviewRepository.vote(reviewId, userId, voteType);

        return {
            message: voteType === "helpful" ? "Marked as helpful" : "Marked as not helpful",
            review: updatedReview,
        };
    },

    /**
     * Report a review
     */
    reportReview: async (
        reviewId: string,
        userId: string,
        reason: string,
        description?: string
    ) => {
        const review = await reviewRepository.findById(reviewId);
        if (!review) {
            throw new AppError("Review not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Can't report own review
        if (review.user._id.toString() === userId) {
            throw new AppError(
                "You cannot report your own review",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        // Check if already reported by this user
        const alreadyReported = review.reports?.some(
            (r: any) => r.reportedBy?.toString() === userId
        );
        if (alreadyReported) {
            throw new AppError(
                "You have already reported this review",
                STATUSCODE.CONFLICT,
                ERROR_CODE.DUPLICATE_ENTRY
            );
        }

        await reviewRepository.report(reviewId, userId, reason, description);

        return {
            message: "Review reported successfully",
        };
    },

    /**
     * Add instructor response to a review
     */
    addInstructorResponse: async (
        reviewId: string,
        instructorId: string,
        content: string
    ) => {
        const review = await reviewRepository.findById(reviewId);
        if (!review) {
            throw new AppError("Review not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Verify the instructor owns the course
        const course = await courseRepository.findById(review.course._id.toString());
        if (!course || course.instructor.toString() !== instructorId) {
            throw new AppError(
                "You don't have permission to respond to this review",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        const updatedReview = await reviewRepository.addInstructorResponse(
            reviewId,
            instructorId,
            content
        );

        return {
            message: "Response added successfully",
            review: updatedReview,
        };
    },
};

export default reviewService;
