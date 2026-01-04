import mongoose, { Schema, Document, Types } from "mongoose";

// ==================== INTERFACES ====================
export interface IQuizQuestion {
    _id?: Types.ObjectId;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    marks: number;
    explanation?: string;
}

export interface IQuiz extends Document {
    _id: Types.ObjectId;
    courseId: Types.ObjectId;
    lessonId: Types.ObjectId;
    contentId: Types.ObjectId;
    type: "quiz";
    title: string;
    description?: string;
    totalMarks: number;
    passingMarks?: number;
    timeLimit?: number; // in minutes
    questions: IQuizQuestion[];
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showCorrectAnswers: boolean;
    maxAttempts: number;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== SCHEMA ====================
const quizQuestionSchema = new Schema<IQuizQuestion>(
    {
        question: {
            type: String,
            required: [true, "Question is required"],
            trim: true,
        },
        options: {
            type: [String],
            required: [true, "Options are required"],
            validate: {
                validator: function (v: string[]) {
                    return v.length >= 2 && v.length <= 6;
                },
                message: "Quiz must have between 2 and 6 options",
            },
        },
        correctAnswerIndex: {
            type: Number,
            required: [true, "Correct answer index is required"],
            min: 0,
        },
        marks: {
            type: Number,
            required: true,
            min: 0,
            default: 1,
        },
        explanation: {
            type: String,
            trim: true,
        },
    },
    { _id: true }
);

const quizSchema = new Schema<IQuiz>(
    {
        courseId: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true,
            index: true,
        },
        lessonId: {
            type: Schema.Types.ObjectId,
            ref: "Lesson",
            required: true,
            index: true,
        },
        contentId: {
            type: Schema.Types.ObjectId,
            ref: "LessonContent",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["quiz"],
            default: "quiz",
        },
        title: {
            type: String,
            required: [true, "Quiz title is required"],
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            trim: true,
        },
        totalMarks: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        passingMarks: {
            type: Number,
            min: 0,
        },
        timeLimit: {
            type: Number, // in minutes
            min: 1,
        },
        questions: {
            type: [quizQuestionSchema],
            default: [],
        },
        shuffleQuestions: {
            type: Boolean,
            default: false,
        },
        shuffleOptions: {
            type: Boolean,
            default: false,
        },
        showCorrectAnswers: {
            type: Boolean,
            default: true,
        },
        maxAttempts: {
            type: Number,
            default: 3,
            min: 1,
        },
    },
    {
        timestamps: true,
    }
);

// Calculate total marks from questions before saving
quizSchema.pre("save", function (next) {
    if (this.questions && this.questions.length > 0) {
        this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    }
    next();
});

// Indexes
quizSchema.index({ courseId: 1, lessonId: 1 });
quizSchema.index({ contentId: 1 }, { unique: true });

const Quiz = mongoose.model<IQuiz>("Quiz", quizSchema);

export default Quiz;
