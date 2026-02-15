
import { Job } from "bullmq";
import { EMAIL_TYPES } from "src/constants/email-types.constants.js";
import emailService from "src/services/auth/otp.service.js";
import logger from "src/utils/logger.js";

export default async function videoReadyProcessor(job: Job) {
    const { email, instructorName, videoTitle, courseName, videoLink } = job.data;

    try {
        await emailService.sendEmail(EMAIL_TYPES.VIDEO_READY, {
            email,
            instructorName,
            videoTitle,
            courseName,
            videoLink,
        } as any);

        logger.info(`✅ Video ready email sent to ${email} for "${videoTitle}"`);
    } catch (error) {
        logger.error(`❌ Failed to send video ready email to ${email}:`, error);
        throw error;
    }
}
