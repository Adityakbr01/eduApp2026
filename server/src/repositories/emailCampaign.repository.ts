import EmailCampaignModel, {
    type IEmailCampaign,
    CampaignStatus,
    RecipientType,
    CampaignPriority,
} from "src/models/emailCampaign.model.js";
import type { Types } from "mongoose";

export const emailCampaignRepository = {
    /**
     * Create a new campaign
     */
    create: async (data: Partial<IEmailCampaign>): Promise<IEmailCampaign> => {
        return EmailCampaignModel.create(data);
    },

    /**
     * Find campaign by ID
     */
    findById: async (id: string | Types.ObjectId): Promise<IEmailCampaign | null> => {
        return EmailCampaignModel.findById(id).lean();
    },

    /**
     * Find all campaigns with optional filters
     */
    findAll: async (filters?: {
        status?: CampaignStatus;
        createdBy?: string | Types.ObjectId;
        limit?: number;
        skip?: number;
    }): Promise<IEmailCampaign[]> => {
        const query: any = {};

        if (filters?.status) query.status = filters.status;
        if (filters?.createdBy) query.createdBy = filters.createdBy;

        return EmailCampaignModel.find(query)
            .sort({ createdAt: -1 })
            .limit(filters?.limit || 50)
            .skip(filters?.skip || 0)
            .lean();
    },

    /**
     * Update campaign
     */
    update: async (
        id: string | Types.ObjectId,
        data: Partial<IEmailCampaign>
    ): Promise<IEmailCampaign | null> => {
        return EmailCampaignModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).lean();
    },

    /**
     * Delete campaign
     */
    delete: async (id: string | Types.ObjectId): Promise<boolean> => {
        const result = await EmailCampaignModel.findByIdAndDelete(id);
        return !!result;
    },

    /**
     * Get campaign statistics
     */
    getStats: async (campaignId: string | Types.ObjectId) => {
        const campaign = await EmailCampaignModel.findById(campaignId).select(
            "sentCount failedCount metadata status"
        ).lean();

        return campaign;
    },

    /**
     * Get campaigns by status
     */
    findByStatus: async (status: CampaignStatus): Promise<IEmailCampaign[]> => {
        return EmailCampaignModel.find({ status }).sort({ createdAt: -1 }).lean();
    },

    /**
     * Count campaigns
     */
    count: async (filters?: { status?: CampaignStatus; createdBy?: string | Types.ObjectId }) => {
        const query: any = {};
        if (filters?.status) query.status = filters.status;
        if (filters?.createdBy) query.createdBy = filters.createdBy;

        return EmailCampaignModel.countDocuments(query);
    },
};
