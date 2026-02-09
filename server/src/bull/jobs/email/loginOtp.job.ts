import { EMAIL_TYPES } from "src/constants/email-types.constants.js";
import emailService from "src/services/auth/otp.service.js";

export default async function loginOtpProcessor(job: { data: { email: string; otp: string } }) {
    const { email, otp } = job.data;
    await emailService.sendEmail(EMAIL_TYPES.TWO_FACTOR_OTP, {
        email,
        otp,
    });
}
