// schema/lessonContent.schema.ts

import mongoose from "mongoose";
import { ContentType } from "src/types/course.type.js";

const videoSchema = new mongoose.Schema({
    rawKey: { type: String, required: false },          // temp mp4 key
    hlsKey: { type: String, required: false },          // prod hls path
    duration: Number,
    minWatchPercent: Number,
    status: {
        type: String,
        enum: ["UPLOADED", "PROCESSING", "READY", "FAILED"],
        default: "UPLOADED",
    },
    failureReason: { type: String, required: false },
    version: { type: Number, required: false, default: 0 },
    isEmailSent: { type: Boolean, default: false },
});


const pdfSchema = new mongoose.Schema({
    url: { type: String, required: true },
    totalPages: { type: Number, min: 1 },
});

const audioSchema = new mongoose.Schema({
    url: { type: String, required: true },
    duration: { type: Number, required: true }, // seconds
});

const assessmentSchema = new mongoose.Schema({
    refId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "assessment.type",
    },
    type: {
        type: String,
        enum: ["quiz", "assignment"],
        required: true,
    },
});


const lessonContentSchema = new mongoose.Schema({
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

    type: {
        type: String,
        enum: Object.values(ContentType),
        required: true,
    },

    title: { type: String, required: true },
    order: { type: Number, required: true },
    marks: { type: Number, default: 100 },

    // NESTED — NOW MATCHES ZOD
    video: { type: videoSchema, sparse: true }, // sparse allows null/undefined
    pdf: { type: pdfSchema, sparse: true },
    assessment: { type: assessmentSchema },
    audio: { type: audioSchema, sparse: true },
    draftID: { type: String }, //draftid for ecs worker

    // Deadline & Penalty
    deadline: {
        dueDate: { type: Date },                                      // When the content is due
        startDate: { type: Date },                                    // When content unlocks (before this → "locked")
        penaltyPercent: { type: Number, default: 30, min: 0, max: 100 }, // Penalty % for late completion
        defaultPenalty: { type: Number, default: 30 },
    },

    // VISIBILITY
    isVisible: { type: Boolean, default: true },
    isPreview: { type: Boolean, default: false }, // Add this too!
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },

}, { timestamps: true });

lessonContentSchema.index({ lessonId: 1, order: 1 });
lessonContentSchema.index({ lessonId: 1, courseId: 1 });

export default mongoose.model("LessonContent", lessonContentSchema);