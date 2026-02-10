import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAssignmentSubmission extends Document {
    userId: Types.ObjectId;
    assignmentId: Types.ObjectId;
    contentAttemptId: Types.ObjectId;
    submissionType: "file" | "text" | "link" | "code";
    content: string; // URL or text content
    codeLanguage?: string;
    submittedAt: Date;
    isLate: boolean;
    penalty?: {
        percent: number;
        deductedMarks: number;
    };
    grade?: {
        obtainedMarks: number;
        feedback?: string;
        gradedBy?: Types.ObjectId;
        gradedAt?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const assignmentSubmissionSchema = new Schema<IAssignmentSubmission>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        assignmentId: {
            type: Schema.Types.ObjectId,
            ref: "Assignment",
            required: true,
            index: true,
        },
        contentAttemptId: {
            type: Schema.Types.ObjectId,
            ref: "ContentAttempt",
            required: true,
        },
        submissionType: {
            type: String,
            enum: ["file", "text", "link", "code"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        codeLanguage: {
            type: String,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        isLate: {
            type: Boolean,
            default: false,
        },
        penalty: {
            percent: { type: Number, default: 0 },
            deductedMarks: { type: Number, default: 0 }
        },
        grade: {
            obtainedMarks: { type: Number },
            feedback: { type: String },
            gradedBy: { type: Schema.Types.ObjectId, ref: "User" },
            gradedAt: { type: Date },
        },
    },
    { timestamps: true }
);

// Index to find submissions by user and assignment
assignmentSubmissionSchema.index({ userId: 1, assignmentId: 1 });

const AssignmentSubmission = mongoose.model<IAssignmentSubmission>(
    "AssignmentSubmission",
    assignmentSubmissionSchema
);

export default AssignmentSubmission;
