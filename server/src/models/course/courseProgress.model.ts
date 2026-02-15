import mongoose from "mongoose";

// ============================================
// COURSE PROGRESS MODEL
// ============================================
// Pre-computed course-level progress per user.
// Updated at WRITE TIME (content completion, grading)
// instead of being recalculated on every read.

const courseProgressSchema = new mongoose.Schema({
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

    // 📊 Content Counts
    totalContents: {
        type: Number,
        default: 0
    },
    completedContents: {
        type: Number,
        default: 0
    },

    // 🎯 Marks
    totalMarks: {
        type: Number,
        default: 0
    },
    obtainedMarks: {
        type: Number,
        default: 0
    },

    // 📈 Pre-computed Progress
    progressPercent: {
        type: Number,
        default: 0
    },

    // 🔓 Write-time unlock state
    unlockedLessonIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
    }],
    unlockedSectionIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
    }],

    // 📅 Activity
    lastActivityAt: {
        type: Date,
        default: Date.now
    },

    // ✅ Course completion
    isCompleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Unique: one progress doc per user per course
courseProgressSchema.index(
    { userId: 1, courseId: 1 },
    { unique: true }
);

// Quick lookup by course for admin analytics
courseProgressSchema.index({ courseId: 1, progressPercent: -1 });

const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);

export default CourseProgress;
