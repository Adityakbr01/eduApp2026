import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
        required: true
    },

    title: { type: String, required: true },
    order: Number,

    // Sequential locking
    isLocked: { type: Boolean, default: true },
    isManuallyUnlocked: { type: Boolean, default: false },

    // Deadline & Penalty
    deadline: {
        dueDate: { type: Date },                                      // When the lesson is due
        startDate: { type: Date },                                    // When lesson unlocks (before this → "locked")
        penaltyPercent: { type: Number, default: 0, min: 0, max: 100 }, // Penalty % for late completion
    },

    isVisible: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
}, { timestamps: true });

lessonSchema.index({ sectionId: 1, courseId: 1 });

export default mongoose.model("Lesson", lessonSchema);
