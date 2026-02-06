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
    _id: string;
    title: string;
    subject: string;
    content: string;
    recipientType: RecipientType;
    recipientIds?: string[];
    status: CampaignStatus;
    scheduledAt?: string;
    priority: CampaignPriority;
    sentCount: number;
    failedCount: number;
    createdBy: string;
    metadata: ICampaignMetadata;
    createdAt: string;
    updatedAt: string;
}

// ==================== DTO INTERFACES ====================

export interface CreateCampaignDTO {
    title: string;
    subject: string;
    content: string;
    recipientType: RecipientType;
    recipientIds?: string[];
    priority?: CampaignPriority;
    tags?: string[];
}

export interface UpdateCampaignDTO {
    title?: string;
    subject?: string;
    content?: string;
    recipientType?: RecipientType;
    recipientIds?: string[];
    priority?: CampaignPriority;
}

export interface SendCampaignDTO {
    scheduledAt?: string;
}

export interface QueryCampaignsDTO {
    status?: CampaignStatus;
    page?: number;
    limit?: number;
}

// ==================== RESPONSE TYPES ====================

export interface CampaignResponse {
    success: boolean;
    data: IEmailCampaign;
    message: string;
}

export interface CampaignsResponse {
    success: boolean;
    data: {
        campaigns: IEmailCampaign[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    };
    message: string;
}

export interface CampaignStatsResponse {
    success: boolean;
    data: {
        sentCount: number;
        failedCount: number;
        status: CampaignStatus;
        metadata: ICampaignMetadata;
    };
    message: string;
}


export interface iStats {
        total: number;
        draft: number;
        completed: number;
        processing: number;
        totalSent: number;
        totalFailed: number;
        totalRecipients: number;
        deliveryRate: string;
    }   