import mongoose from "mongoose";

const contentAttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
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
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LessonContent",
        required: true
    },

    // 🔁 RESUME (unified)
    resumeAt: {
        type: Number,       // seconds (video) | page (pdf)
        default: 0
    },
    totalDuration: {
        type: Number        // seconds (video) | total pages (pdf)
    },

    // 🎯 MARKS
    totalMarks: Number,          // snapshot from LessonContent.marks
    obtainedMarks: {
        type: Number,
        default: 0
    },

    isCompleted: {
        type: Boolean,
        default: false
    },
    lastAccessedAt: Date
}, { timestamps: true });

// Unique constraint: one attempt per user per content
contentAttemptSchema.index(
    { userId: 1, contentId: 1 },
    { unique: true }
);

// 🚀 Performance index for "Continue Learning" feature
// Optimized for: find latest attempt by userId + courseId, sorted by lastAccessedAt DESC
contentAttemptSchema.index(
    { userId: 1, courseId: 1, lastAccessedAt: -1 }
);

export default mongoose.model("ContentAttempt", contentAttemptSchema);
