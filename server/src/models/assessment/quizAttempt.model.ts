import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuizResponse {
    questionId: Types.ObjectId;
    selectedOptionIndex: number;
    isCorrect: boolean;
    marks: number;
}

export interface IQuizAttempt extends Document {
    userId: Types.ObjectId;
    quizId: Types.ObjectId;
    contentAttemptId: Types.ObjectId; // Link to the main progress record
    responses: IQuizResponse[];
    score: number;
    totalMarks: number;
    isCompleted: boolean;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const quizResponseSchema = new Schema<IQuizResponse>(
    {
        questionId: { type: Schema.Types.ObjectId, required: true },
        selectedOptionIndex: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
        marks: { type: Number, required: true, default: 0 },
    },
    { _id: false }
);

const quizAttemptSchema = new Schema<IQuizAttempt>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        quizId: {
            type: Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
            index: true,
        },
        contentAttemptId: {
            type: Schema.Types.ObjectId,
            ref: "ContentAttempt",
            required: true,
        },
        responses: {
            type: [quizResponseSchema],
            default: [],
        },
        score: {
            type: Number,
            default: 0,
        },
        totalMarks: {
            type: Number,
            required: true,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Compound index to quickly find a user's attempt for a specific quiz
quizAttemptSchema.index({ userId: 1, quizId: 1 });

const QuizAttempt = mongoose.model<IQuizAttempt>("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;
