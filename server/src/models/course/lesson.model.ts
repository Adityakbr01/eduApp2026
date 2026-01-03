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

    isVisible: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Lesson", lessonSchema);
