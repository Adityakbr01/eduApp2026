import type { Job } from "bullmq";
import { Resend } from "resend";
import { env } from "src/configs/env.js";
import { EMAIL_TYPES } from "src/constants/email-types.constants.js";
import emailService from "src/services/auth/otp.service.js";
import logger from "src/utils/logger.js";

const resend = new Resend(env.RESEND_API_KEY);

export interface PaymentSuccessJobData {
    to: string;
    userName: string;
    courseTitle: string;
    amount: number;
    currency: string;
    orderId: string;
}


const paymentSuccessProcessor = async (job: Job<PaymentSuccessJobData>) => {
    const { to } = job.data;

    try {
        await emailService.sendEmail(EMAIL_TYPES.PAYMENT_SUCCESS, job.data as any);

        logger.info(`✅ Payment success email sent to ${to}`);
        return { success: true, to };
    } catch (error) {
        logger.error(`❌ Failed to send payment success email to ${to}:`, error);
        throw error;
    }
};

export default paymentSuccessProcessor;