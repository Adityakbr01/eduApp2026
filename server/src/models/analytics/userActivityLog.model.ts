import mongoose from "mongoose";

// ============================================
// USER ACTIVITY LOG MODEL
// ============================================
// Event-sourced activity tracking for analytics,
// streaks, heatmaps, and engagement metrics.
// Inserted via BullMQ worker (never in API request cycle).

const userActivityLogSchema = new mongoose.Schema({
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
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LessonContent",
    },
    action: {
        type: String,
        enum: ["OPEN", "COMPLETE", "SUBMIT", "GRADE"],
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: false }); // We use our own timestamp field

// 🚀 Performance indexes for analytics queries
// Heatmap: daily activity counts per user
userActivityLogSchema.index({ userId: 1, timestamp: -1 });

// Course-level analytics (e.g., "how many students completed X today")
userActivityLogSchema.index({ courseId: 1, action: 1, timestamp: -1 });

// User + course + action for streak/engagement queries
userActivityLogSchema.index({ userId: 1, courseId: 1, action: 1, timestamp: -1 });

const UserActivityLog = mongoose.model("UserActivityLog", userActivityLogSchema);

export default UserActivityLog;
