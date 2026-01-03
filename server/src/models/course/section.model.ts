import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },

    title: { type: String, required: true },
    order: Number,

    isVisible: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Section", sectionSchema);
