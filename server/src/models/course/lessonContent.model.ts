// schema/lessonContent.schema.ts

import mongoose from "mongoose";
import { ContentType } from "src/types/course.type.js";

const videoSchema = new mongoose.Schema({
  rawKey: { type: String,required: false },          // temp mp4 key
  hlsKey: { type: String, required: false },          // prod hls path
  duration: Number,
  minWatchPercent: Number,
  status: {
    type: String,
    enum: ["UPLOADED", "PROCESSING", "READY", "FAILED"],
    default: "UPLOADED",
  },
failureReason: { type: String, required: false },
version: { type: Number, required: false },
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
    refId: { type: mongoose.Schema.Types.ObjectId },
    type: {
        type: String,
        enum: ["quiz", "assignment"],
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
    marks: { type: Number, default: 0 },

    // NESTED — NOW MATCHES ZOD
    video: { type: videoSchema, sparse: true }, // sparse allows null/undefined
    pdf: { type: pdfSchema, sparse: true },
    assessment: { type: assessmentSchema },
    audio: { type: audioSchema, sparse: true },
    draftID: { type: String }, //draftid for ecs worker

    // VISIBILITY
    isVisible: { type: Boolean, default: true },
    isPreview: { type: Boolean, default: false }, // Add this too!
}, { timestamps: true });

lessonContentSchema.index({ lessonId: 1, order: 1 });

export default mongoose.model("LessonContent", lessonContentSchema);