import mongoose, { Schema, type Document, type Types } from "mongoose";

// ==================== ENUMS ====================
export enum PaymentStatus {
    CREATED = "created",
    AUTHORIZED = "authorized",
    CAPTURED = "captured",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded",
}

export enum PaymentMethod {
    RAZORPAY = "razorpay",
    FREE = "free",
}

// ==================== INTERFACE ====================
export interface IPayment extends Document {
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    enrollmentId?: Types.ObjectId;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    method: PaymentMethod;
    receipt?: string;
    notes?: Record<string, string>;
    failureReason?: string;
    refundId?: string;
    refundedAt?: Date;
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== SCHEMA ====================
const paymentSchema = new Schema<IPayment>(
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
        enrollmentId: {
            type: Schema.Types.ObjectId,
            ref: "Enrollment",
            index: true,
        },
        razorpayOrderId: {
            type: String,
            required: [true, "Razorpay Order ID is required"],
            unique: true,
            trim: true,
        },
        razorpayPaymentId: {
            type: String,
            trim: true,
            index: true,
        },
        razorpaySignature: {
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
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.CREATED,
            index: true,
        },
        method: {
            type: String,
            enum: Object.values(PaymentMethod),
            default: PaymentMethod.RAZORPAY,
        },
        receipt: {
            type: String,
            trim: true,
        },
        notes: {
            type: Map,
            of: String,
        },
        failureReason: {
            type: String,
            trim: true,
        },
        refundId: {
            type: String,
            trim: true,
        },
        refundedAt: {
            type: Date,
        },
        paidAt: {
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
// Compound index for user payments
paymentSchema.index({ userId: 1, status: 1 });

// Index for course payments
paymentSchema.index({ courseId: 1, status: 1 });

// ==================== VIRTUALS ====================
paymentSchema.virtual("user", {
    ref: "User",
    localField: "userId",
    foreignField: "_id",
    justOne: true,
});

paymentSchema.virtual("course", {
    ref: "Course",
    localField: "courseId",
    foreignField: "_id",
    justOne: true,
});

paymentSchema.virtual("enrollment", {
    ref: "Enrollment",
    localField: "enrollmentId",
    foreignField: "_id",
    justOne: true,
});

// ==================== MODEL ====================
const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
