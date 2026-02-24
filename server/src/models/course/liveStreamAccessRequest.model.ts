import mongoose, { type Document, type Types } from "mongoose";

// ==================== INTERFACE ====================
export interface ILiveStreamAccessRequest extends Document {
    _id: Types.ObjectId;
    instructorId: Types.ObjectId;
    status: "pending" | "approved" | "rejected";
    processedBy?: Types.ObjectId;
    processedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== SCHEMA ====================
const liveStreamAccessRequestSchema = new mongoose.Schema(
    {
        instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // One active request/status per instructor
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        processedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// ==================== INDEXES ====================
liveStreamAccessRequestSchema.index({ status: 1 });

const LiveStreamAccessRequest = mongoose.model<ILiveStreamAccessRequest>(
    "LiveStreamAccessRequest",
    liveStreamAccessRequestSchema
);

export default LiveStreamAccessRequest;
