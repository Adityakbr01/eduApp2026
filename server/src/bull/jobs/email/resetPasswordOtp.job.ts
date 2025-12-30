import { EMAIL_TYPES } from "src/constants/email-types.constants.js";
import emailService from "src/services/otp.service.js";

export default async function resetPasswordOtpProcessor(job) {
    const { email, otp } = job.data;
    await emailService.sendEmail(EMAIL_TYPES.PASSWORD_RESET_OTP, {
        email,
        otp,
    });
}
