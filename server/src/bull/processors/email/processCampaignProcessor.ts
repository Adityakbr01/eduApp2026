import type { Job } from "bullmq";
import EmailCampaignModel, { CampaignStatus } from "src/models/emailCampaign.model.js";
import UserModel from "src/models/user.model.js";
import logger from "src/utils/logger.js";
import UserPreferenceModel from "src/models/userPreference.model.js";
import type { ProcessCampaignJobData } from "src/bull/jobs/email/processCampaign.job.js";
import { sendMarketingEmailJob } from "src/bull/jobs/email/marketingEmail.job.js";

/**
 * Process an email campaign by dispatching individual email jobs
 */
export default async function processCampaignProcessor(job: Job<ProcessCampaignJobData>) {
    const { campaignId, priority } = job.data;

    try {
        // Get campaign
        const campaign = await EmailCampaignModel.findById(campaignId);
        if (!campaign) {
            throw new Error(`Campaign ${campaignId} not found`);
        }

        // Update status to processing
        await EmailCampaignModel.findByIdAndUpdate(campaignId, {
            status: CampaignStatus.PROCESSING,
        });

        // Get recipients based on recipient type
        let recipients: any[] = [];

        if (campaign.recipientType === "all") {
            recipients = await UserModel.find({ isEmailVerified: true }).select("_id email name").lean();
        } else if (campaign.recipientType === "students") {
            recipients = await UserModel.find({
                isEmailVerified: true,
                "roleId.name": "Student",
            }).select("_id email name").lean();
        } else if (campaign.recipientType === "instructors") {
            recipients = await UserModel.find({
                isEmailVerified: true,
                "roleId.name": "Instructor",
            }).select("_id email name").lean();
        } else if (campaign.recipientType === "managers") {
            recipients = await UserModel.find({
                isEmailVerified: true,
                "roleId.name": "Manager",
            }).select("_id email name").lean();
        } else if (campaign.recipientType === "specific" && campaign.recipientIds) {
            recipients = await UserModel.find({
                _id: { $in: campaign.recipientIds },
                isEmailVerified: true,
            }).select("_id email name").lean();
        }

        // Filter by email preferences (respect marketing opt-out)
        const userIds = recipients.map((r) => r._id);
        const preferences = await UserPreferenceModel.find({
            userId: { $in: userIds },
            "email.marketing": true, // Only send to users who opted in
        }).select("userId").lean();

        const optedInUserIds = new Set(preferences.map((p) => p.userId.toString()));
        const filteredRecipients = recipients.filter((r) => optedInUserIds.has(r._id.toString()));

        logger.info(`📧 Processing campaign ${campaignId}: ${filteredRecipients.length} recipients (${recipients.length - filteredRecipients.length} opted out)`);

        // Dispatch individual email jobs
        const emailJobs = filteredRecipients.map((recipient) =>
            sendMarketingEmailJob({
                campaignId: campaignId.toString(),
                userId: recipient._id.toString(),
                email: recipient.email,
                subject: campaign.subject,
                content: campaign.content,
                priority: campaign.priority as "low" | "normal" | "high",
            })
        );

        await Promise.all(emailJobs);

        // Update campaign metadata
        await EmailCampaignModel.findByIdAndUpdate(campaignId, {
            status: CampaignStatus.COMPLETED,
            "metadata.actualRecipients": filteredRecipients.length,
            sentCount: filteredRecipients.length,
        });

        logger.info(`✅ Campaign ${campaignId} processed successfully`);

        return {
            success: true,
            campaignId,
            recipientsCount: filteredRecipients.length,
        };
    } catch (error: any) {
        logger.error(`❌ Failed to process campaign ${campaignId}:`, error);

        // Update campaign status to failed
        await EmailCampaignModel.findByIdAndUpdate(campaignId, {
            status: CampaignStatus.FAILED,
        });

        throw error;
    }
}
