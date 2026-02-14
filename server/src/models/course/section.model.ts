import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },

    title: { type: String, required: true },
    order: Number,

    // Sequential locking
    isLocked: { type: Boolean, default: true },             // Auto: locked until previous section completed
    isManuallyUnlocked: { type: Boolean, default: false, UnlockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } },  // Instructor override

    isVisible: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
}, { timestamps: true });

sectionSchema.index({ courseId: 1, order: 1 });

export default mongoose.model("Section", sectionSchema);
