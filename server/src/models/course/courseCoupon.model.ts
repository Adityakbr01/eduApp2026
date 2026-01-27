import mongoose, { Schema } from "mongoose";

// Coupon Types
export enum CouponType {
    PERCENTAGE = "percentage",
    FIXED_AMOUNT = "fixed_amount",
}

// Coupon Status
export enum CouponStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    EXPIRED = "expired",
    EXHAUSTED = "exhausted", // When usage limit is reached
}

// Coupon Scope - what the coupon applies to
export enum CouponScope {
    ALL_COURSES = "all_courses",
    SPECIFIC_COURSES = "specific_courses",
    SPECIFIC_CATEGORIES = "specific_categories",
    SPECIFIC_INSTRUCTORS = "specific_instructors",
}

const courseCouponSchema = new mongoose.Schema(
    {
        // Coupon Code (unique identifier for users to apply)
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            uppercase: true,
            trim: true,
            minlength: [3, "Coupon code must be at least 3 characters"],
            maxlength: [20, "Coupon code cannot exceed 20 characters"],
            index: true,
        },

        // Coupon Name (for admin reference)
        name: {
            type: String,
            required: [true, "Coupon name is required"],
            trim: true,
            maxlength: [100, "Coupon name cannot exceed 100 characters"],
        },

        // Description
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
        },

        // Discount Type
        type: {
            type: String,
            enum: Object.values(CouponType),
            required: [true, "Coupon type is required"],
        },

        // Discount Value (percentage or fixed amount based on type)
        discountValue: {
            type: Number,
            required: [true, "Discount value is required"],
            min: [0, "Discount value cannot be negative"],
            validate: {
                validator: function (this: any, value: number) {
                    if (this.type === CouponType.PERCENTAGE) {
                        return value <= 100;
                    }
                    return true;
                },
                message: "Percentage discount cannot exceed 100%",
            },
        },

        // Maximum discount amount (useful for percentage discounts)
        maxDiscountAmount: {
            type: Number,
            min: 0,
        },

        // Minimum purchase amount required
        minPurchaseAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Currency (for fixed amount coupons)
        currency: {
            type: String,
            default: "USD",
        },

        // Coupon Scope
        scope: {
            type: String,
            enum: Object.values(CouponScope),
            default: CouponScope.ALL_COURSES,
        },

        // Applicable Courses (when scope is SPECIFIC_COURSES)
        applicableCourses: [
            {
                type: Schema.Types.ObjectId,
                ref: "Course",
            },
        ],

        // Applicable Categories (when scope is SPECIFIC_CATEGORIES)
        applicableCategories: [
            {
                type: Schema.Types.ObjectId,
                ref: "Category",
            },
        ],

        // Applicable Instructors (when scope is SPECIFIC_INSTRUCTORS)
        applicableInstructors: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // Excluded Courses (courses where this coupon cannot be applied)
        excludedCourses: [
            {
                type: Schema.Types.ObjectId,
                ref: "Course",
            },
        ],

        // Validity Period
        startDate: {
            type: Date,
            required: [true, "Start date is required"],
            index: true,
        },
        endDate: {
            type: Date,
            required: [true, "End date is required"],
            index: true,
            validate: {
                validator: function (this: any, value: Date) {
                    return value > this.startDate;
                },
                message: "End date must be after start date",
            },
        },

        // Usage Limits
        usageLimit: {
            type: Number,
            min: 1,
            default: null, // null = unlimited
        },
        usageLimitPerUser: {
            type: Number,
            min: 1,
            default: 1,
        },
        timesUsed: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Users who have used this coupon (for tracking per-user usage)
        usedBy: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                usageCount: {
                    type: Number,
                    default: 1,
                    min: 1,
                },
                lastUsedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // First-time buyer only
        firstPurchaseOnly: {
            type: Boolean,
            default: false,
        },

        // Status
        status: {
            type: String,
            enum: Object.values(CouponStatus),
            default: CouponStatus.ACTIVE,
            index: true,
        },

        // Creator
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Metadata for analytics
        metadata: {
            totalDiscountGiven: { type: Number, default: 0, min: 0 },
            totalOrdersApplied: { type: Number, default: 0, min: 0 },
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for efficient querying
courseCouponSchema.index({ startDate: 1, endDate: 1, status: 1 });
courseCouponSchema.index({ "usedBy.user": 1 });

// Virtual to check if coupon is currently valid
courseCouponSchema.virtual("isValid").get(function () {
    const now = new Date();
    return (
        this.status === CouponStatus.ACTIVE &&
        this.startDate <= now &&
        this.endDate >= now &&
        (this.usageLimit === null || this.timesUsed < this.usageLimit)
    );
});

// Virtual for remaining uses
courseCouponSchema.virtual("remainingUses").get(function () {
    if (this.usageLimit === null) return null; // Unlimited
    return Math.max(0, this.usageLimit - this.timesUsed);
});

// Pre-save hook to update status
courseCouponSchema.pre("save", function (next) {
    const now = new Date();

    // Auto-expire if past end date
    if (this.endDate < now && this.status === CouponStatus.ACTIVE) {
        this.status = CouponStatus.EXPIRED;
    }

    // Mark as exhausted if usage limit reached
    if (
        this.usageLimit !== null &&
        this.timesUsed >= this.usageLimit &&
        this.status === CouponStatus.ACTIVE
    ) {
        this.status = CouponStatus.EXHAUSTED;
    }

    next();
});

// Static method to find valid coupon by code
courseCouponSchema.statics.findValidCoupon = async function (code: string) {
    const now = new Date();
    return this.findOne({
        code: code.toUpperCase(),
        status: CouponStatus.ACTIVE,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $or: [{ usageLimit: null }, { $expr: { $lt: ["$timesUsed", "$usageLimit"] } }],
    });
};

export default mongoose.model("CourseCoupon", courseCouponSchema);
