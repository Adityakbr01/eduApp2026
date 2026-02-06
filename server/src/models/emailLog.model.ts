import { Schema, model, Types } from "mongoose";

// ==================== ENUMS ====================
export enum EmailLogStatus {
    PENDING = "pending",
    SENT = "sent",
    FAILED = "failed",
    BOUNCED = "bounced",
}

// ==================== INTERFACES ====================
export interface IEmailLogMetadata {
    jobId?: string;
    attempts: number;
    lastAttemptAt?: Date;
    errorCode?: string;
}

export interface IEmailLog {
    _id: Types.ObjectId;
    campaignId: Types.ObjectId;
    userId: Types.ObjectId;
    email: string;
    status: EmailLogStatus;
    sentAt?: Date;
    error?: string;
    metadata: IEmailLogMetadata;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== SCHEMA ====================
const emailLogMetadataSchema = new Schema<IEmailLogMetadata>(
    {
        jobId: String,
        attempts: {
            type: Number,
            default: 0,
        },
        lastAttemptAt: Date,
        errorCode: String,
    },
    { _id: false }
);

const emailLogSchema = new Schema<IEmailLog>(
    {
        campaignId: {
            type: Schema.Types.ObjectId,
            ref: "EmailCampaign",
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        status: {
            type: String,
            enum: Object.values(EmailLogStatus),
            required: true,
            default: EmailLogStatus.PENDING,
        },
        sentAt: Date,
        error: String,
        metadata: {
            type: emailLogMetadataSchema,
            required: true,
            default: () => ({ attempts: 0 }),
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
emailLogSchema.index({ campaignId: 1, status: 1 });
emailLogSchema.index({ userId: 1, campaignId: 1 });

const EmailLogModel = model<IEmailLog>("EmailLog", emailLogSchema);

export default EmailLogModel;
