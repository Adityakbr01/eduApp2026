import mongoose, { Schema, type Document, type Types } from "mongoose";

// ==================== ENUMS ====================
export enum EnrollmentStatus {
    PENDING = "pending",
    ACTIVE = "active",
    FAILED = "failed",
    CANCELLED = "cancelled",
    EXPIRED = "expired",
}

// ==================== INTERFACE ====================
export interface IEnrollment extends Document {
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    paymentId?: string;
    orderId?: string;
    amount: number;
    currency: string;
    status: EnrollmentStatus;
    enrolledAt: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== SCHEMA ====================
const enrollmentSchema = new Schema<IEnrollment>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: [true, "Course ID is required"],
            index: true,
        },
        paymentId: {
            type: String,
            trim: true,
        },
        orderId: {
            type: String,
            trim: true,
        },
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [0, "Amount cannot be negative"],
        },
        currency: {
            type: String,
            default: "INR",
            uppercase: true,
            trim: true,
        },
        status: {
            type: String,
            enum: Object.values(EnrollmentStatus),
            default: EnrollmentStatus.PENDING,
            index: true,
        },
        enrolledAt: {
            type: Date,
        },
        expiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ==================== INDEXES ====================
// Compound unique index to prevent duplicate enrollments
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Index for querying by order ID (used in payment verification)
enrollmentSchema.index({ orderId: 1 });

// Index for payment ID lookups
enrollmentSchema.index({ paymentId: 1 });

// ==================== VIRTUALS ====================
enrollmentSchema.virtual("user", {
    ref: "User",
    localField: "userId",
    foreignField: "_id",
    justOne: true,
});

enrollmentSchema.virtual("course", {
    ref: "Course",
    localField: "courseId",
    foreignField: "_id",
    justOne: true,
});

// ==================== MODEL ====================
const Enrollment = mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);

export default Enrollment;
