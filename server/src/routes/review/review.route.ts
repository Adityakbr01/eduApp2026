import { Router } from "express";
import { z } from "zod";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import reviewController from "src/controllers/review/review.controller.js";
import { validateRequest } from "src/middlewares/custom/validateRequest.js";

const router = Router();

// ============================================
// VALIDATION SCHEMAS
// ============================================
const createReviewSchema = z.object({
    rating: z
        .number()
        .int("Rating must be a whole number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5"),
    title: z
        .string()
        .max(100, "Title cannot exceed 100 characters")
        .optional(),
    content: z
        .string()
        .min(10, "Review must be at least 10 characters")
        .max(2000, "Review cannot exceed 2000 characters"),
});

const updateReviewSchema = z.object({
    rating: z
        .number()
        .int("Rating must be a whole number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5")
        .optional(),
    title: z
        .string()
        .max(100, "Title cannot exceed 100 characters")
        .optional(),
    content: z
        .string()
        .min(10, "Review must be at least 10 characters")
        .max(2000, "Review cannot exceed 2000 characters")
        .optional(),
});

const voteSchema = z.object({
    voteType: z.enum(["helpful", "not_helpful"], {
        error: () => ({ message: "Vote type must be 'helpful' or 'not_helpful'" }),
    }),
});

const reportSchema = z.object({
    reason: z.enum(["spam", "inappropriate", "fake", "offensive", "irrelevant", "other"], {
        error: () => ({
            message: "Invalid reason. Must be one of: spam, inappropriate, fake, offensive, irrelevant, other",
        }),
    }),
    description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
});

const instructorResponseSchema = z.object({
    content: z
        .string()
        .min(1, "Response content is required")
        .max(1000, "Response cannot exceed 1000 characters"),
});

// ============================================
// 🌐 PUBLIC ROUTES (No auth required)
// ============================================

/**
 * @route   GET /api/v1/reviews/:courseId
 * @desc    Get all reviews for a course
 * @access  Public
 */
router.get("/:courseId", reviewController.getCourseReviews);

// ============================================
// 🔐 AUTH MIDDLEWARE FOR PROTECTED ROUTES
// ============================================
router.use(authMiddleware);

// ============================================
// 📝 REVIEW ROUTES (Authenticated users)
// ============================================

/**
 * @route   POST /api/v1/reviews/:courseId
 * @desc    Create a new review for a course
 * @access  Private (Enrolled users only)
 */
router.post(
    "/:courseId",
    validateRequest(createReviewSchema),
    reviewController.createReview
);

/**
 * @route   GET /api/v1/reviews/:courseId/my-review
 * @desc    Get user's own review for a course
 * @access  Private
 */
router.get("/:courseId/my-review", reviewController.getMyReview);

/**
 * @route   PUT /api/v1/reviews/:reviewId
 * @desc    Update a review
 * @access  Private (Review owner only)
 */
router.put(
    "/:reviewId",
    validateRequest(updateReviewSchema),
    reviewController.updateReview
);

/**
 * @route   DELETE /api/v1/reviews/:reviewId
 * @desc    Delete a review
 * @access  Private (Review owner only)
 */
router.delete("/:reviewId", reviewController.deleteReview);

/**
 * @route   POST /api/v1/reviews/:reviewId/vote
 * @desc    Vote on a review (helpful/not helpful)
 * @access  Private
 */
router.post(
    "/:reviewId/vote",
    validateRequest(voteSchema),
    reviewController.voteReview
);

/**
 * @route   POST /api/v1/reviews/:reviewId/report
 * @desc    Report a review
 * @access  Private
 */
router.post(
    "/:reviewId/report",
    validateRequest(reportSchema),
    reviewController.reportReview
);

/**
 * @route   POST /api/v1/reviews/:reviewId/respond
 * @desc    Add instructor response to a review
 * @access  Private (Course instructor only)
 */
router.post(
    "/:reviewId/respond",
    validateRequest(instructorResponseSchema),
    reviewController.addInstructorResponse
);

export default router;
