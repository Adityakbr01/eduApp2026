import { Schema } from "mongoose";
import { BatchStatus, CourseLevel, CourseStatus, Currency, DeliveryMode, Language } from "../../types/course.type.js";


export type SocialLinkType =
    | "discord"
    | "github"
    | "youtube"
    | "website"
    | "other";

export interface SocialLink {
    type: SocialLinkType;
    url: string;
    isPublic: boolean;
}




export const socialLinkSchema = new Schema<SocialLink>({
    type: {
        type: String,
        enum: ["discord", "github", "youtube", "website", "other"],
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
});

import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({

    // Categorization
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    subCategory: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    tags: {
        type: [String],
        default: [],
        validate: {
            validator: (v: string[]) => v.length <= 10,
            message: "Cannot have more than 10 tags",
        },
    },


    // Course Details
    level: {
        type: String,
        enum: Object.values(CourseLevel),
        default: CourseLevel.BEGINNER,
    },
    courseLanguage: {
        type: String,
        enum: Object.values(Language),
        default: Language.ENGLISH,
    },
    deliveryMode: {
        type: String,
        enum: Object.values(DeliveryMode),
        default: DeliveryMode.RECORDED,
    },


    // Status & Visibility
    status: {
        type: String,
        enum: Object.values(CourseStatus),
        default: CourseStatus.DRAFT,
    },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date },


    // Enrollment
    totalEnrollments: { type: Number, default: 0, min: 0 },
    maxEnrollments: { type: Number, min: 1, max: 1000, default: 100 },

    // Course Duration (in weeks)
    durationWeeks: {
        type: Number,
        default: 1,
        min: 1,
        max: 520, // Max 10 years
    },

    // Instructors
    instructor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Instructor is required"],
    },

    // Basic Information
    title: {
        type: String,
        required: [true, "Course title is required"],
        trim: true,
        minlength: [5, "Title must be at least 5 characters"],
        maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    subtitle: {
        type: String,
        trim: true,
        maxlength: [200, "Subtitle cannot exceed 200 characters"],
    },
    description: {
        type: String,
        required: [true, "Course description is required"],
    },
    shortDescription: {
        type: String,
        required: [true, "Short description is required"],
        maxlength: [500, "Short description cannot exceed 500 characters"],
    },

    //New items
    previewVideoUrl: { type: String },
    thumbnail: {
        key: { type: String },          // S3 key
        version: { type: Number, default: 0 },
    },
    //New items
    batch: {
        type: {
            startDate: { type: Date },
            endDate: { type: Date },
            batchName: { type: String },
            batchId: { type: String },
            batchStatus: { type: String, enum: Object.values(BatchStatus), default: BatchStatus.UPCOMING },
        },
        required: true,
    },

    Deleted: {
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
        deletedReason: { type: String },
    },

    mentorSupport: {
        type: Boolean,
        default: true,
    },

    location: { type: String },
    accessDuration: {
        type: Number,
        default: 365, // in days, 0 = lifetime
        min: 0,
    },

    // Pricing
    pricing: {
        originalPrice: { type: Number, required: true, min: 0 }, // Price set by instructor
        price: { type: Number, min: 0, default: 0 }, // Auto-calculated final price
        discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
        discountExpiresAt: { type: Date }, // When the discount expires
        currency: {
            type: String,
            enum: Object.values(Currency),
            default: Currency.USD,
        },
        isFree: { type: Boolean, default: false },
    },

    // Rating Statistics (aggregated from reviews)
    ratingStats: {
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        totalReviews: { type: Number, default: 0, min: 0 },
        ratingsDistribution: {
            one: { type: Number, default: 0, min: 0 },
            two: { type: Number, default: 0, min: 0 },
            three: { type: Number, default: 0, min: 0 },
            four: { type: Number, default: 0, min: 0 },
            five: { type: Number, default: 0, min: 0 },
        },
    },

    // Content
    curriculum: { type: String, default: "" }, // Markdown text for curriculum/syllabus
    // Ratings

    coInstructors: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    // Timestamps
    lastUpdated: { type: Date, default: Date.now },

    // Ordering
    order: { type: Number, default: 0 },

    //Links
    socialLinks: {
        type: [socialLinkSchema],
        default: [],
    },
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    });

// ============================================
// PRE-SAVE HOOK: Auto-calculate price from originalPrice and discountPercentage
// ============================================
courseSchema.pre("save", function (next) {
    if (this.pricing) {
        const originalPrice = this.pricing.originalPrice || 0;
        const discountPercentage = this.pricing.discountPercentage || 0;
        const discountExpiresAt = this.pricing.discountExpiresAt;

        // Check if discount is active (not expired)
        const isDiscountActive = discountPercentage > 0 &&
            (!discountExpiresAt || new Date(discountExpiresAt) > new Date());

        if (this.pricing.isFree) {
            this.pricing.price = 0;
        } else if (isDiscountActive) {
            // Calculate discounted price
            const discountAmount = (originalPrice * discountPercentage) / 100;
            this.pricing.price = Math.round((originalPrice - discountAmount) * 100) / 100;
        } else {
            // No discount or expired, price equals originalPrice
            this.pricing.price = originalPrice;
        }
    }
    next();
});

// Pre-update hook for findOneAndUpdate operations
courseSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
    const update = this.getUpdate() as any;

    if (update?.pricing || update?.$set?.pricing) {
        const pricing = update.pricing || update.$set?.pricing;
        const originalPrice = pricing.originalPrice ?? 0;
        const discountPercentage = pricing.discountPercentage ?? 0;
        const discountExpiresAt = pricing.discountExpiresAt;
        const isFree = pricing.isFree ?? false;

        // Check if discount is active
        const isDiscountActive = discountPercentage > 0 &&
            (!discountExpiresAt || new Date(discountExpiresAt) > new Date());

        let calculatedPrice: number;
        if (isFree) {
            calculatedPrice = 0;
        } else if (isDiscountActive) {
            const discountAmount = (originalPrice * discountPercentage) / 100;
            calculatedPrice = Math.round((originalPrice - discountAmount) * 100) / 100;
        } else {
            calculatedPrice = originalPrice;
        }

        // Set the calculated price
        if (update.pricing) {
            update.pricing.price = calculatedPrice;
        } else if (update.$set?.pricing) {
            update.$set.pricing.price = calculatedPrice;
        }
    }
    next();
});

export default mongoose.model("Course", courseSchema);
