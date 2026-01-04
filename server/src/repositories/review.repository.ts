import mongoose from "mongoose";
import CourseReview, { ReviewStatus } from "../models/course/courseReview.model.js";

// ============================================
// REVIEW REPOSITORY
// ============================================
export const reviewRepository = {
    /**
     * Create a new review
     */
    create: async (data: {
        course: string;
        user: string;
        enrollment?: string;
        rating: number;
        title?: string;
        content: string;
        isVerifiedPurchase?: boolean;
        courseCompletionPercentage?: number;
    }) => {
        return CourseReview.create(data);
    },

    /**
     * Find review by ID
     */
    findById: async (reviewId: string) => {
        return CourseReview.findById(reviewId)
            .populate("user", "name email profileImage")
            .populate("course", "title slug");
    },

    /**
     * Find user's review for a course
     */
    findUserReview: async (courseId: string, userId: string) => {
        return CourseReview.findOne({
            course: new mongoose.Types.ObjectId(courseId),
            user: new mongoose.Types.ObjectId(userId),
            isDeleted: false,
        });
    },

    /**
     * Get all reviews for a course with pagination
     */
    findByCourse: async (
        courseId: string,
        options: {
            page?: number;
            limit?: number;
            status?: ReviewStatus;
            sortBy?: "recent" | "helpful" | "rating_high" | "rating_low";
        } = {}
    ) => {
        const { page = 1, limit = 10, status = ReviewStatus.APPROVED, sortBy = "recent" } = options;
        const skip = (page - 1) * limit;

        // Build sort options
        let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
        switch (sortBy) {
            case "helpful":
                sortOptions = { helpfulVotes: -1, createdAt: -1 };
                break;
            case "rating_high":
                sortOptions = { rating: -1, createdAt: -1 };
                break;
            case "rating_low":
                sortOptions = { rating: 1, createdAt: -1 };
                break;
            default:
                sortOptions = { createdAt: -1 };
        }

        const [reviews, total] = await Promise.all([
            CourseReview.find({
                course: new mongoose.Types.ObjectId(courseId),
                status,
                isDeleted: false,
            })
                .populate("user", "name email profileImage")
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            CourseReview.countDocuments({
                course: new mongoose.Types.ObjectId(courseId),
                status,
                isDeleted: false,
            }),
        ]);

        return {
            reviews,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    },

    /**
     * Update a review
     */
    update: async (
        reviewId: string,
        userId: string,
        data: {
            rating?: number;
            title?: string;
            content?: string;
        }
    ) => {
        const review = await CourseReview.findOne({
            _id: new mongoose.Types.ObjectId(reviewId),
            user: new mongoose.Types.ObjectId(userId),
            isDeleted: false,
        });

        if (!review) return null;

        // Store edit history
        if (data.rating || data.content) {
            review.editHistory.push({
                previousContent: review.content,
                previousRating: review.rating,
                editedAt: new Date(),
            });
            review.isEdited = true;
        }

        if (data.rating) review.rating = data.rating;
        if (data.title !== undefined) review.title = data.title;
        if (data.content) review.content = data.content;

        await review.save();
        return review;
    },

    /**
     * Soft delete a review
     */
    softDelete: async (reviewId: string, userId: string) => {
        return CourseReview.findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(reviewId),
                user: new mongoose.Types.ObjectId(userId),
                isDeleted: false,
            },
            {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: new mongoose.Types.ObjectId(userId),
            },
            { new: true }
        );
    },

    /**
     * Vote on a review (helpful/not helpful)
     */
    vote: async (reviewId: string, userId: string, voteType: "helpful" | "not_helpful") => {
        const review = await CourseReview.findById(reviewId);
        if (!review) return null;

        // Check if user already voted
        const existingVoteIndex = review.voters.findIndex(
            (v) => v.user?.toString() === userId
        );

        if (existingVoteIndex !== -1) {
            const existingVote = review.voters[existingVoteIndex];

            // Same vote - remove it
            if (existingVote.voteType === voteType) {
                review.voters.splice(existingVoteIndex, 1);
                if (voteType === "helpful") {
                    review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
                } else {
                    review.notHelpfulVotes = Math.max(0, review.notHelpfulVotes - 1);
                }
            } else {
                // Different vote - switch it
                if (existingVote.voteType === "helpful") {
                    review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
                    review.notHelpfulVotes += 1;
                } else {
                    review.notHelpfulVotes = Math.max(0, review.notHelpfulVotes - 1);
                    review.helpfulVotes += 1;
                }
                existingVote.voteType = voteType;
                existingVote.votedAt = new Date();
            }
        } else {
            // New vote
            review.voters.push({
                user: new mongoose.Types.ObjectId(userId),
                voteType,
                votedAt: new Date(),
            });
            if (voteType === "helpful") {
                review.helpfulVotes += 1;
            } else {
                review.notHelpfulVotes += 1;
            }
        }

        await review.save();
        return review;
    },

    /**
     * Get rating summary for a course
     */
    getCourseRatingSummary: async (courseId: string) => {
        return (CourseReview as any).getCourseRatingSummary(courseId);
    },

    /**
     * Report a review
     */
    report: async (
        reviewId: string,
        userId: string,
        reason: string,
        description?: string
    ) => {
        return CourseReview.findByIdAndUpdate(
            reviewId,
            {
                $push: {
                    reports: {
                        reportedBy: new mongoose.Types.ObjectId(userId),
                        reason,
                        description,
                        reportedAt: new Date(),
                    },
                },
                $inc: { reportCount: 1 },
            },
            { new: true }
        );
    },

    /**
     * Add instructor response
     */
    addInstructorResponse: async (
        reviewId: string,
        instructorId: string,
        content: string
    ) => {
        return CourseReview.findByIdAndUpdate(
            reviewId,
            {
                instructorResponse: {
                    content,
                    respondedAt: new Date(),
                    respondedBy: new mongoose.Types.ObjectId(instructorId),
                },
            },
            { new: true }
        );
    },
};

export default reviewRepository;
