import mongoose, { Schema } from "mongoose";

// Review Status
export enum ReviewStatus {
    PENDING = "pending", // Awaiting moderation
    APPROVED = "approved",
    REJECTED = "rejected",
    FLAGGED = "flagged", // Flagged for review
}

const courseReviewSchema = new mongoose.Schema(
    {
        // Course being reviewed
        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: [true, "Course is required"],
            index: true,
        },

        // User who wrote the review
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            index: true,
        },

        // Enrollment reference (to verify user was enrolled)
        enrollment: {
            type: Schema.Types.ObjectId,
            ref: "Enrollment",
        },

        // Star Rating (1-5)
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"],
            validate: {
                validator: Number.isInteger,
                message: "Rating must be a whole number",
            },
        },

        // Review Title
        title: {
            type: String,
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"],
        },

        // Review Content
        content: {
            type: String,
            required: [true, "Review content is required"],
            trim: true,
            minlength: [10, "Review must be at least 10 characters"],
            maxlength: [2000, "Review cannot exceed 2000 characters"],
        },

        // Detailed Ratings (optional sub-ratings)
        detailedRatings: {
            contentQuality: {
                type: Number,
                min: 1,
                max: 5,
            },
            instructorSkills: {
                type: Number,
                min: 1,
                max: 5,
            },
            valueForMoney: {
                type: Number,
                min: 1,
                max: 5,
            },
            courseStructure: {
                type: Number,
                min: 1,
                max: 5,
            },
            practicalApplication: {
                type: Number,
                min: 1,
                max: 5,
            },
        },

        // Review Status
        status: {
            type: String,
            enum: Object.values(ReviewStatus),
            default: ReviewStatus.APPROVED, // Auto-approve or set to PENDING for moderation
            index: true,
        },

        // Helpful votes
        helpfulVotes: {
            type: Number,
            default: 0,
            min: 0,
        },
        notHelpfulVotes: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Users who voted (to prevent duplicate votes)
        voters: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
                voteType: {
                    type: String,
                    enum: ["helpful", "not_helpful"],
                },
                votedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // Instructor Response
        instructorResponse: {
            content: {
                type: String,
                trim: true,
                maxlength: [1000, "Response cannot exceed 1000 characters"],
            },
            respondedAt: {
                type: Date,
            },
            respondedBy: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        },

        // Verified Purchase Badge
        isVerifiedPurchase: {
            type: Boolean,
            default: false,
        },

        // Course Completion Percentage at time of review
        courseCompletionPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        // Flags for moderation
        reportCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        reports: [
            {
                reportedBy: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
                reason: {
                    type: String,
                    enum: [
                        "spam",
                        "inappropriate",
                        "fake",
                        "offensive",
                        "irrelevant",
                        "other",
                    ],
                },
                description: String,
                reportedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // Edit History
        isEdited: {
            type: Boolean,
            default: false,
        },
        editHistory: [
            {
                previousContent: String,
                previousRating: Number,
                editedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // Soft delete
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        deletedAt: {
            type: Date,
        },
        deletedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Compound index for unique review per user per course
courseReviewSchema.index({ course: 1, user: 1 }, { unique: true });

// Index for efficient queries
courseReviewSchema.index({ course: 1, status: 1, rating: -1 });
courseReviewSchema.index({ course: 1, status: 1, createdAt: -1 });
courseReviewSchema.index({ user: 1, createdAt: -1 });
courseReviewSchema.index({ course: 1, status: 1, helpfulVotes: -1 });

// Virtual for helpfulness score
courseReviewSchema.virtual("helpfulnessScore").get(function () {
    const total = this.helpfulVotes + this.notHelpfulVotes;
    if (total === 0) return 0;
    return (this.helpfulVotes / total) * 100;
});

// Virtual for average detailed rating
courseReviewSchema.virtual("averageDetailedRating").get(function () {
    const ratings = this.detailedRatings;
    if (!ratings) return null;

    const values = [
        ratings.contentQuality,
        ratings.instructorSkills,
        ratings.valueForMoney,
        ratings.courseStructure,
        ratings.practicalApplication,
    ].filter((r) => r !== undefined && r !== null);

    if (values.length === 0) return null;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
});

// Static method to get course rating summary
courseReviewSchema.statics.getCourseRatingSummary = async function (courseId: string) {
    const result = await this.aggregate([
        {
            $match: {
                course: new mongoose.Types.ObjectId(courseId),
                status: ReviewStatus.APPROVED,
                isDeleted: false,
            },
        },
        {
            $group: {
                _id: "$course",
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
                ratingsDistribution: {
                    $push: "$rating",
                },
            },
        },
        {
            $project: {
                averageRating: { $round: ["$averageRating", 1] },
                totalReviews: 1,
                ratingsDistribution: {
                    one: {
                        $size: {
                            $filter: {
                                input: "$ratingsDistribution",
                                cond: { $eq: ["$$this", 1] },
                            },
                        },
                    },
                    two: {
                        $size: {
                            $filter: {
                                input: "$ratingsDistribution",
                                cond: { $eq: ["$$this", 2] },
                            },
                        },
                    },
                    three: {
                        $size: {
                            $filter: {
                                input: "$ratingsDistribution",
                                cond: { $eq: ["$$this", 3] },
                            },
                        },
                    },
                    four: {
                        $size: {
                            $filter: {
                                input: "$ratingsDistribution",
                                cond: { $eq: ["$$this", 4] },
                            },
                        },
                    },
                    five: {
                        $size: {
                            $filter: {
                                input: "$ratingsDistribution",
                                cond: { $eq: ["$$this", 5] },
                            },
                        },
                    },
                },
            },
        },
    ]);

    return (
        result[0] || {
            averageRating: 0,
            totalReviews: 0,
            ratingsDistribution: { one: 0, two: 0, three: 0, four: 0, five: 0 },
        }
    );
};

// Post-save hook to update course rating stats
courseReviewSchema.post("save", async function () {
    const CourseModel = mongoose.model("Course");
    const summary = await (this.constructor as any).getCourseRatingSummary(this.course);

    await CourseModel.findByIdAndUpdate(this.course, {
        "ratingStats.averageRating": summary.averageRating,
        "ratingStats.totalReviews": summary.totalReviews,
        "ratingStats.ratingsDistribution": summary.ratingsDistribution,
    });
});

// Post-remove hook to update course rating stats
courseReviewSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        const CourseModel = mongoose.model("Course");
        const CourseReviewModel = mongoose.model("CourseReview");
        const summary = await (CourseReviewModel as any).getCourseRatingSummary(doc.course);

        await CourseModel.findByIdAndUpdate(doc.course, {
            "ratingStats.averageRating": summary.averageRating,
            "ratingStats.totalReviews": summary.totalReviews,
            "ratingStats.ratingsDistribution": summary.ratingsDistribution,
        });
    }
});

export default mongoose.model("CourseReview", courseReviewSchema);
