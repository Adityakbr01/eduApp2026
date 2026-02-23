import type { Job } from "bullmq";
import { Resend } from "resend";
import { env } from "src/configs/env.js";
import { EMAIL_TYPES } from "src/constants/email-types.constants.js";
import emailService from "src/services/auth/otp.service.js";
import logger from "src/utils/logger.js";

const resend = new Resend(env.RESEND_API_KEY);

export interface NotificationEmailJobData {
    to: string;
    subject: string;
    template: string;
    context: {
        title: string;
        message: string;
        link: string;
        name: string;
    };
}


export default async function notificationEmailProcessor(job: Job<NotificationEmailJobData>) {
    const { to } = job.data;

    try {
        await emailService.sendEmail(EMAIL_TYPES.NOTIFICATION_EMAIL, job.data as any);

        logger.info(`✅ Notification email sent to ${to}`);
        return { success: true, to };
    } catch (error) {
        logger.error(`❌ Failed to send notification email to ${to}:`, error);
        throw error;
    }
}
