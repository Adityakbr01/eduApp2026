import { Schema, model, Types } from "mongoose";

// ==================== ENUMS ====================
export enum CampaignStatus {
    DRAFT = "draft",
    SCHEDULED = "scheduled",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
}

export enum RecipientType {
    ALL = "all",
    STUDENTS = "students",
    INSTRUCTORS = "instructors",
    MANAGERS = "managers",
    SPECIFIC = "specific",
}

export enum CampaignPriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
}

// ==================== INTERFACES ====================
export interface ICampaignMetadata {
    filterCriteria?: any;
    estimatedRecipients: number;
    actualRecipients?: number;
    tags?: string[];
}

export interface IEmailCampaign {
    _id: Types.ObjectId;
    title: string;
    subject: string;
    content: string; // HTML content
    recipientType: RecipientType;
    recipientIds?: Types.ObjectId[]; // For specific recipients
    status: CampaignStatus;
    scheduledAt?: Date;
    priority: CampaignPriority;
    sentCount: number;
    failedCount: number;
    createdBy: Types.ObjectId; // Admin/Manager who created
    metadata: ICampaignMetadata;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== SCHEMA ====================
const campaignMetadataSchema = new Schema<ICampaignMetadata>(
    {
        filterCriteria: Schema.Types.Mixed,
        estimatedRecipients: {
            type: Number,
            required: true,
            default: 0,
        },
        actualRecipients: Number,
        tags: [String],
    },
    { _id: false }
);

const emailCampaignSchema = new Schema<IEmailCampaign>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        content: {
            type: String,
            required: true,
        },
        recipientType: {
            type: String,
            enum: Object.values(RecipientType),
            required: true,
            default: RecipientType.ALL,
        },
        recipientIds: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        status: {
            type: String,
            enum: Object.values(CampaignStatus),
            required: true,
            default: CampaignStatus.DRAFT,
        },
        scheduledAt: Date,
        priority: {
            type: String,
            enum: Object.values(CampaignPriority),
            required: true,
            default: CampaignPriority.NORMAL,
        },
        sentCount: {
            type: Number,
            default: 0,
        },
        failedCount: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        metadata: {
            type: campaignMetadataSchema,
            required: true,
            default: () => ({ estimatedRecipients: 0 }),
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
emailCampaignSchema.index({ status: 1, createdAt: -1 });
emailCampaignSchema.index({ createdBy: 1, status: 1 });
emailCampaignSchema.index({ scheduledAt: 1 }, { sparse: true });

const EmailCampaignModel = model<IEmailCampaign>("EmailCampaign", emailCampaignSchema);

export default EmailCampaignModel;
