import { emailCampaignRepository } from "src/repositories/emailCampaign.repository.js";
import { CampaignStatus, RecipientType, type IEmailCampaign } from "src/models/emailCampaign.model.js";
import { processCampaignJob } from "src/bull/jobs/email/processCampaign.job.js";
import logger from "src/utils/logger.js";
import type { Types } from "mongoose";
import UserModel from "src/models/user.model.js";

export const emailCampaignService = {
    /**
     * Create a draft campaign
     */
    createCampaign: async (data: {
        title: string;
        subject: string;
        content: string;
        recipientType: RecipientType;
        recipientIds?: string[];
        priority?: string;
        createdBy: string | Types.ObjectId;
        tags?: string[];
    }) => {
        // Estimate recipient count
        let estimatedRecipients = 0;

        if (data.recipientType === RecipientType.ALL) {
            estimatedRecipients = await UserModel.countDocuments({ isEmailVerified: true });
        } else if (data.recipientType === RecipientType.STUDENTS) {
            estimatedRecipients = await UserModel.countDocuments({
                isEmailVerified: true,
                "roleId.name": "Student",
            });
        } else if (data.recipientType === RecipientType.INSTRUCTORS) {
            estimatedRecipients = await UserModel.countDocuments({
                isEmailVerified: true,
                "roleId.name": "Instructor",
            });
        } else if (data.recipientType === RecipientType.MANAGERS) {
            estimatedRecipients = await UserModel.countDocuments({
                isEmailVerified: true,
                "roleId.name": "Manager",
            });
        } else if (data.recipientType === RecipientType.SPECIFIC && data.recipientIds) {
            estimatedRecipients = data.recipientIds.length;
        }

        const campaign = await emailCampaignRepository.create({
            ...data,
            status: CampaignStatus.DRAFT,
            sentCount: 0,
            failedCount: 0,
            metadata: {
                estimatedRecipients,
                tags: data.tags,
            },
        } as any);

        logger.info(`📧 Campaign created: ${campaign._id} with ~${estimatedRecipients} recipients`);

        return campaign;
    },

    /**
     * Schedule or immediately send a campaign
     */
    sendCampaign: async (campaignId: string, scheduledAt?: Date) => {
        const campaign = await emailCampaignRepository.findById(campaignId);

        if (!campaign) {
            throw new Error("Campaign not found");
        }

        if (campaign.status !== CampaignStatus.DRAFT && campaign.status !== CampaignStatus.SCHEDULED) {
            throw new Error(`Cannot send campaign with status: ${campaign.status}`);
        }

        const updateData: Partial<IEmailCampaign> = {
            status: scheduledAt ? CampaignStatus.SCHEDULED : CampaignStatus.PROCESSING,
            scheduledAt: scheduledAt || undefined,
        };

        await emailCampaignRepository.update(campaignId, updateData);

        // If immediate send, dispatch to BullMQ
        if (!scheduledAt) {
            await processCampaignJob({
                campaignId: campaignId.toString(),
                priority: campaign.priority as "low" | "normal" | "high",
            });

            logger.info(`🚀 Campaign ${campaignId} dispatched to queue`);
        } else {
            logger.info(`📅 Campaign ${campaignId} scheduled for ${scheduledAt}`);
        }

        return emailCampaignRepository.findById(campaignId);
    },

    /**
     * Get campaign by ID
     */
    getCampaign: async (campaignId: string) => {
        const campaign = await emailCampaignRepository.findById(campaignId);

        if (!campaign) {
            throw new Error("Campaign not found");
        }

        return campaign;
    },

    /**
     * Get all campaigns with filters
     */
    getCampaigns: async (filters?: {
        status?: CampaignStatus;
        createdBy?: string;
        limit?: number;
        page?: number;
    }) => {
        const limit = filters?.limit || 20;
        const page = filters?.page || 1;
        const skip = (page - 1) * limit;

        const campaigns = await emailCampaignRepository.findAll({
            status: filters?.status,
            createdBy: filters?.createdBy,
            limit,
            skip,
        });

        const total = await emailCampaignRepository.count({
            status: filters?.status,
            createdBy: filters?.createdBy,
        });

        return {
            campaigns,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * Update campaign (only for drafts)
     */
    updateCampaign: async (
        campaignId: string,
        data: {
            title?: string;
            subject?: string;
            content?: string;
            recipientType?: RecipientType;
            recipientIds?: string[];
            priority?: string;
        }
    ) => {
        const campaign = await emailCampaignRepository.findById(campaignId);

        if (!campaign) {
            throw new Error("Campaign not found");
        }

        if (campaign.status !== CampaignStatus.DRAFT) {
            throw new Error("Only draft campaigns can be edited");
        }

        const updated = await emailCampaignRepository.update(campaignId, data as any);

        logger.info(`✏️ Campaign ${campaignId} updated`);

        return updated;
    },

    /**
     * Delete campaign (only drafts)
     */
    deleteCampaign: async (campaignId: string) => {
        const campaign = await emailCampaignRepository.findById(campaignId);

        if (!campaign) {
            throw new Error("Campaign not found");
        }

        if (campaign.status !== CampaignStatus.DRAFT) {
            throw new Error("Only draft campaigns can be deleted");
        }

        await emailCampaignRepository.delete(campaignId);

        logger.info(`🗑️ Campaign ${campaignId} deleted`);

        return true;
    },

    /**
     * Get campaign statistics
     */
    getCampaignStats: async (campaignId: string) => {
        const stats = await emailCampaignRepository.getStats(campaignId);
        return stats;
    },

    /**
     * Cancel a scheduled campaign
     */
    cancelCampaign: async (campaignId: string) => {
        const campaign = await emailCampaignRepository.findById(campaignId);

        if (!campaign) {
            throw new Error("Campaign not found");
        }

        if (campaign.status !== CampaignStatus.SCHEDULED) {
            throw new Error("Only scheduled campaigns can be cancelled");
        }

        await emailCampaignRepository.update(campaignId, {
            status: CampaignStatus.CANCELLED,
        } as any);

        logger.info(`❌ Campaign ${campaignId} cancelled`);

        return emailCampaignRepository.findById(campaignId);
    },
};
