import mongoose from "mongoose";
import { ContentType } from "src/types/course.type.js";

const lessonContentSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
        required: true
    },

    type: {
        type: String,
        enum: Object.values(ContentType),
        default: ContentType.VIDEO,
    },

    title: { type: String, required: true },
    order: {
        type: Number,
        required: true
    },

    // 🎯 MARKS (single source of truth)
    marks: { type: Number, required: true },

    // 🎥 VIDEO
    videoUrl: String,
    duration: Number,            // seconds
    minWatchPercent: { type: Number, default: 90 },

    // 📄 PDF
    pdfUrl: String,
    totalPages: Number,

    // 📝 QUIZ / ASSIGNMENT
    assessment: {
        refId: mongoose.Schema.Types.ObjectId,
        type: {
            type: String,
            enum: ["quiz", "assignment"]
        }
    },

    isVisible: { type: Boolean, default: true }
}, { timestamps: true });

lessonContentSchema.index({ lessonId: 1, order: 1 });

export default mongoose.model("LessonContent", lessonContentSchema);
