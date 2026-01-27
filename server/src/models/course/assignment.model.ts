import mongoose, { Schema, Document, Types } from "mongoose";

// ==================== INTERFACES ====================
export interface ISubmissionConfig {
    type: "file" | "text" | "link" | "code";
    allowedFormats?: string[];
    maxFileSizeMB?: number;
}

export interface IAssignment extends Document {
    _id: Types.ObjectId;
    courseId: Types.ObjectId;
    lessonId: Types.ObjectId;
    contentId: Types.ObjectId;
    type: "assignment";
    title: string;
    description: string;
    instructions: string[];
    submission: ISubmissionConfig;
    totalMarks: number;
    dueDate?: Date;
    isAutoEvaluated: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== SCHEMA ====================
const submissionConfigSchema = new Schema<ISubmissionConfig>(
    {
        type: {
            type: String,
            enum: ["file", "text", "link", "code"],
            required: true,
            default: "file",
        },
        allowedFormats: {
            type: [String],
            default: ["pdf", "zip", "doc", "docx"],
        },
        maxFileSizeMB: {
            type: Number,
            default: 10,
            min: 1,
            max: 100,
        },
    },
    { _id: false }
);

const assignmentSchema = new Schema<IAssignment>(
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
            enum: ["assignment"],
            default: "assignment",
        },
        title: {
            type: String,
            required: [true, "Assignment title is required"],
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            required: [true, "Assignment description is required"],
            trim: true,
        },
        instructions: {
            type: [String],
            default: [],
        },
        submission: {
            type: submissionConfigSchema,
            required: true,
            default: () => ({
                type: "file",
                allowedFormats: ["pdf", "zip"],
                maxFileSizeMB: 10,
            }),
        },
        totalMarks: {
            type: Number,
            required: true,
            min: 0,
            default: 100,
        },
        dueDate: {
            type: Date,
        },
        isAutoEvaluated: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
assignmentSchema.index({ courseId: 1, lessonId: 1 });

const Assignment = mongoose.model<IAssignment>("Assignment", assignmentSchema);

export default Assignment;
