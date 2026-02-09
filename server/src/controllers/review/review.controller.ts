
// ============================================
// REVIEW CONTROLLER

import reviewService from "src/services/review/review.service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";

// ============================================
export const reviewController = {
    /**
     * Create a new review
     * POST /api/v1/reviews/:courseId
     */
    createReview: catchAsync<{ courseId: string }>(async (req, res) => {
        const userId = req.user!.id;
        const { courseId } = req.params;
        const { rating, title, content } = req.body;

        const result = await reviewService.createReview({
            courseId,
            userId,
            rating,
            title,
            content,
        });

        sendResponse(res, 201, result.message, { review: result.review });
    }),

    /**
     * Get reviews for a course
     * GET /api/v1/reviews/:courseId
     */
    getCourseReviews: catchAsync<{ courseId: string }>(async (req, res) => {
        const { courseId } = req.params;
        const { page, limit, sortBy } = req.query as {
            page?: string;
            limit?: string;
            sortBy?: "recent" | "helpful" | "rating_high" | "rating_low";
        };

        const result = await reviewService.getCourseReviews(courseId, {
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            sortBy,
        });

        sendResponse(res, 200, "Reviews fetched successfully", result);
    }),

    /**
     * Get user's review for a course
     * GET /api/v1/reviews/:courseId/my-review
     */
    getMyReview: catchAsync<{ courseId: string }>(async (req, res) => {
        const userId = req.user!.id;
        const { courseId } = req.params;

        const result = await reviewService.getUserReview(courseId, userId);

        sendResponse(res, 200, "Review fetched successfully", result);
    }),

    /**
     * Update a review
     * PUT /api/v1/reviews/:reviewId
     */
    updateReview: catchAsync<{ reviewId: string }>(async (req, res) => {
        const userId = req.user!.id;
        const { reviewId } = req.params;
        const { rating, title, content } = req.body;

        const result = await reviewService.updateReview(reviewId, userId, {
            rating,
            title,
            content,
        });

        sendResponse(res, 200, result.message, { review: result.review });
    }),

    /**
     * Delete a review
     * DELETE /api/v1/reviews/:reviewId
     */
    deleteReview: catchAsync<{ reviewId: string }>(async (req, res) => {
        const userId = req.user!.id;
        const { reviewId } = req.params;

        const result = await reviewService.deleteReview(reviewId, userId);

        sendResponse(res, 200, result.message);
    }),

    /**
     * Vote on a review
     * POST /api/v1/reviews/:reviewId/vote
     */
    voteReview: catchAsync<{ reviewId: string }>(async (req, res) => {
        const userId = req.user!.id;
        const { reviewId } = req.params;
        const { voteType } = req.body;

        const result = await reviewService.voteReview(reviewId, userId, voteType);

        sendResponse(res, 200, result.message, { review: result.review });
    }),

    /**
     * Report a review
     * POST /api/v1/reviews/:reviewId/report
     */
    reportReview: catchAsync<{ reviewId: string }>(async (req, res) => {
        const userId = req.user!.id;
        const { reviewId } = req.params;
        const { reason, description } = req.body;

        const result = await reviewService.reportReview(reviewId, userId, reason, description);

        sendResponse(res, 200, result.message);
    }),

    /**
     * Add instructor response
     * POST /api/v1/reviews/:reviewId/respond
     */
    addInstructorResponse: catchAsync<{ reviewId: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const { reviewId } = req.params;
        const { content } = req.body;

        const result = await reviewService.addInstructorResponse(reviewId, instructorId, content);

        sendResponse(res, 200, result.message, { review: result.review });
    }),
};

export default reviewController;
