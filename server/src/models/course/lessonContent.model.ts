import mongoose from "mongoose";

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
        enum: ["video", "pdf", "assignment", "quiz"],
        required: true
    },

    title: { type: String, required: true },
    order: Number,

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
    quizId: mongoose.Schema.Types.ObjectId,

    isVisible: { type: Boolean, default: true }
}, { timestamps: true });

lessonContentSchema.index({ lessonId: 1, order: 1 });

export default mongoose.model("LessonContent", lessonContentSchema);
