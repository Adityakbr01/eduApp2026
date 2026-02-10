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

    // Anti-cheat: how was this marked complete?
    completionMethod: {
        type: String,
        enum: ["auto", "manual"],
        default: "auto",
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

const ContentAttempt = mongoose.model("ContentAttempt", contentAttemptSchema);

// 🛠️ SELF-HEALING: Drop legacy index that causes DUPLICATE_RESOURCE errors
// The old index was { userId: 1 }, which prevents a user from having more than one attempt globally.
// We now rely on { userId: 1, contentId: 1 }.
ContentAttempt.collection.dropIndex("userId_1")
    .then(() => console.log("✅ Dropped legacy index 'userId_1' from ContentAttempt"))
    .catch((err) => {
        // Ignore error if index doesn't exist (code 27)
        if (err.code !== 27) {
            console.log("ℹ️ Index 'userId_1' not found or already dropped.");
        }
    });

export default ContentAttempt;
