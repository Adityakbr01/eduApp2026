import type { Job } from "bullmq";
import type { SendMarketingEmailJobData } from "./marketingEmail.job.js";
import { Resend } from "resend";
import { env } from "src/configs/env.js";
import EmailLogModel, { EmailLogStatus } from "src/models/emailLog.model.js";
import logger from "src/utils/logger.js";

const resend = new Resend(env.RESEND_API_KEY);

/**
 * Process a single marketing email job
 */
export default async function marketingEmailProcessor(job: Job<SendMarketingEmailJobData>) {
    const { campaignId, userId, email, subject, content } = job.data;

    try {
        // Create email log entry
        const emailLog = await EmailLogModel.create({
            campaignId,
            userId,
            email,
            status: EmailLogStatus.PENDING,
            metadata: {
                jobId: job.id,
                attempts: job.attemptsMade + 1,
                lastAttemptAt: new Date(),
            },
        });

        // Send the email using Resend
        await resend.emails.send({
            from: "no-reply@edulaunch.shop",
            to: email,
            subject,
            html: content,
        });

        // Update log status to sent
        await EmailLogModel.findByIdAndUpdate(emailLog._id, {
            status: EmailLogStatus.SENT,
            sentAt: new Date(),
        });

        logger.info(`✅ Marketing email sent to ${email} for campaign ${campaignId}`);

        return { success: true, email, campaignId };
    } catch (error: any) {
        logger.error(`❌ Failed to send marketing email to ${email}:`, error);

        // Update log with error
        await EmailLogModel.findOneAndUpdate(
            { campaignId, userId },
            {
                status: EmailLogStatus.FAILED,
                error: error.message,
                $inc: { "metadata.attempts": 1 },
                "metadata.lastAttemptAt": new Date(),
            }
        );

        throw error; // Re-throw for BullMQ retry logic
    }
}
