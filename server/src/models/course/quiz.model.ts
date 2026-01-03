import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    courseId: mongoose.Schema.Types.ObjectId,
    lessonId: mongoose.Schema.Types.ObjectId,

    questions: [
        {
            question: String,
            options: [String],
            correctAnswer: Number,
            marks: Number
        }
    ]
}, { timestamps: true });

export default mongoose.model("Quiz", quizSchema);
