import { Schema, model } from "mongoose";
import type { ICourse, IDiscountCode } from "../../types/course.type.js";
import { CourseLevel, CourseStatus, Currency, DeliveryMode } from "../../types/course.type.js";

// Import sub-schemas from separate files
import { RatingSchema } from "./schemas/courseInfo.schema.js";
import { CoursePerkSchema, DiscountCodeSchema, PricingSchema } from "./schemas/pricing.schema.js";

// ==================== MAIN COURSE SCHEMA ====================

const CourseSchema = new Schema<ICourse>(
    {
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
        coverImage: { type: String },
        previewVideoUrl: { type: String },
        thumbnailUrl: { type: String },

        // Categorization
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            // Optional for drafts, can be required for publishing
        },
        subCategory: {
            type: Schema.Types.ObjectId,
            ref: "Category",
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
        language: {
            type: String,
            default: "English",
            trim: true,
        },
        deliveryMode: {
            type: String,
            enum: Object.values(DeliveryMode),
            default: DeliveryMode.RECORDED,
        },
        location: { type: String },
        accessDuration: {
            type: Number,
            default: 365, // in days, 0 = lifetime
            min: 0,
        },

        // Pricing
        pricing: {
            type: PricingSchema,
            required: true,
            default: () => ({
                originalPrice: 0,
                discountPercentage: 0,
                finalPrice: 0,
                currency: Currency.INR,
                isGstApplicable: true,
                gstPercentage: 18,
            }),
        },
        discountCodes: { type: [DiscountCodeSchema], default: undefined },

        // Content
        perks: { type: [CoursePerkSchema], default: [] },
        curriculum: { type: String, default: "" }, // Markdown text for curriculum/syllabus
        // Ratings
        rating: {
            type: RatingSchema,
            default: () => ({
                averageRating: 0,
                totalRatings: 0,
                ratingDistribution: {
                    five: 0,
                    four: 0,
                    three: 0,
                    two: 0,
                    one: 0,
                },
            }),
        },

        // Enrollment
        totalEnrollments: { type: Number, default: 0, min: 0 },
        maxEnrollments: { type: Number, min: 1 },

        // Instructors
        instructor: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Instructor is required"],
        },
        coInstructors: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // Status & Visibility
        status: {
            type: String,
            enum: Object.values(CourseStatus),
            default: CourseStatus.DRAFT,
        },
        isPublished: { type: Boolean, default: false },
        isFeatured: { type: Boolean, default: false },
        publishedAt: { type: Date },

        // SEO
        seoTitle: { type: String, maxlength: 70 },
        seoDescription: { type: String, maxlength: 160 },
        seoKeywords: { type: [String], default: [] },

        // Timestamps
        lastUpdated: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ==================== INDEXES ====================
CourseSchema.index({ slug: 1 });
CourseSchema.index({ title: "text", description: "text", tags: "text" });
CourseSchema.index({ category: 1, subCategory: 1 });
CourseSchema.index({ instructor: 1 });
CourseSchema.index({ status: 1, isPublished: 1 });
CourseSchema.index({ "pricing.finalPrice": 1 });
CourseSchema.index({ "rating.averageRating": -1 });
CourseSchema.index({ totalEnrollments: -1 });
CourseSchema.index({ createdAt: -1 });
CourseSchema.index({ isFeatured: 1, isPublished: 1 });

// ==================== PRE-SAVE HOOKS ====================
CourseSchema.pre("save", function (next) {
    // Generate slug if not present
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .substring(0, 100);

        // Add unique suffix
        this.slug = `${this.slug}-${Date.now().toString(36)}`;
    }

    // Calculate final price
    if (this.pricing) {
        const discount = this.pricing.originalPrice * (this.pricing.discountPercentage / 100);
        this.pricing.finalPrice = Math.round(this.pricing.originalPrice - discount);
    }

    // Set publishedAt when status changes to published
    if (this.isModified("status") && this.status === CourseStatus.PUBLISHED && !this.publishedAt) {
        this.publishedAt = new Date();
        this.isPublished = true;
    }

    // Update lastUpdated
    this.lastUpdated = new Date();

    next();
});

// ==================== VIRTUALS ====================
CourseSchema.virtual("isDiscounted").get(function () {
    return this.pricing && this.pricing.discountPercentage > 0;
});

CourseSchema.virtual("isFree").get(function () {
    return this.pricing && this.pricing.finalPrice === 0;
});

// ==================== STATIC METHODS ====================
CourseSchema.statics.findBySlug = function (slug: string) {
    return this.findOne({ slug, isPublished: true });
};

CourseSchema.statics.findPublished = function () {
    return this.find({ isPublished: true, status: CourseStatus.PUBLISHED });
};

CourseSchema.statics.findFeatured = function (limit = 10) {
    return this.find({ isFeatured: true, isPublished: true })
        .sort({ totalEnrollments: -1 })
        .limit(limit);
};

// Static method to recalculate metadata for a course (simplified - curriculum is now markdown)
CourseSchema.statics.recalculateMetadata = async function (courseId: string) {
    const course = await this.findById(courseId);
    if (!course) return null;

    // For markdown curriculum, we don't auto-calculate metadata
    // Metadata can be set manually if needed
    return this.findByIdAndUpdate(
        courseId,
        {
            $set: {
                lastUpdated: new Date(),
            },
        },
        { new: true }
    );
};

// ==================== INSTANCE METHODS ====================
CourseSchema.methods.calculateFinalPrice = function (discountCode?: string) {
    let discount = this.pricing.discountPercentage;

    if (discountCode && this.discountCodes) {
        const code = this.discountCodes.find(
            (dc: IDiscountCode) =>
                dc.code === discountCode.toUpperCase() &&
                dc.isActive &&
                new Date() >= dc.validFrom &&
                new Date() <= dc.validTill &&
                (!dc.maxUses || dc.currentUses < dc.maxUses)
        );
        if (code) {
            discount = Math.max(discount, code.discountPercentage);
        }
    }

    const finalPrice = this.pricing.originalPrice * (1 - discount / 100);
    return Math.round(finalPrice);
};

// ==================== EXPORT ====================
export const CourseModel = model<ICourse>("Course", CourseSchema);
