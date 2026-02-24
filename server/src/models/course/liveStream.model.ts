import mongoose, { type Document, type Types } from "mongoose";

// ==================== INTERFACE ====================
export interface ILiveStream extends Document {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    courseId: Types.ObjectId;
    lessonId: Types.ObjectId;
    lessonContentId?: Types.ObjectId;
    instructorId: Types.ObjectId;
    liveId: string;
    serverUrl: string;
    streamKey: string;
    chatSecret: string;
    chatEmbedCode: string;
    playerEmbedCode: string;
    status: "scheduled" | "live" | "ended";
    scheduledAt?: Date;
    autoSaveRecording: boolean;
    recordingTitle: string;
    recordingDescription: string;
    recordingOrder?: number;
    recordedVideoId?: string;
    recordingProcessed: boolean;
    webhookProcessedEvents: string[];
    createdAt: Date;
    updatedAt: Date;
}

// ==================== SCHEMA ====================
const liveStreamSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },

        description: { type: String, default: "" },

        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },

        lessonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson",
            required: true,
        },

        lessonContentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LessonContent",
        },

        instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // VdoCipher Live ID (unique identifier from VdoCipher)
        liveId: {
            type: String,
            unique: true,
            required: true,
        },

        // RTMP Credentials (never exposed to students)
        serverUrl: { type: String, required: true },
        streamKey: { type: String, required: true, select: false },
        chatSecret: { type: String, select: false },
        chatEmbedCode: { type: String },
        playerEmbedCode: { type: String },

        // Stream Status
        status: {
            type: String,
            enum: ["scheduled", "live", "ended"],
            default: "scheduled",
        },

        // Scheduling
        scheduledAt: { type: Date },

        // Recording metadata for auto lesson creation
        autoSaveRecording: { type: Boolean, default: true },
        recordingTitle: { type: String, required: true },
        recordingDescription: { type: String, default: "" },
        recordingOrder: { type: Number },

        // Filled after webhook recording.ready
        recordedVideoId: { type: String },

        // Idempotency: prevents duplicate LessonContent creation
        recordingProcessed: { type: Boolean, default: false },

        // Idempotency: tracks which webhook events have been processed
        webhookProcessedEvents: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

// ==================== INDEXES ====================
liveStreamSchema.index({ courseId: 1, status: 1 });
liveStreamSchema.index({ instructorId: 1, status: 1 });
liveStreamSchema.index({ courseId: 1, lessonId: 1 });

const LiveStream = mongoose.model<ILiveStream>("LiveStream", liveStreamSchema);

export default LiveStream;
