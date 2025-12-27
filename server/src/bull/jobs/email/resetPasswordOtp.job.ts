import emailService, { EmailType } from "src/services/otp.service.js";

export default async function resetPasswordOtpProcessor(job) {
    const { email, otp } = job.data;

    await emailService.sendEmail(EmailType.PASSWORD_RESET_OTP, {
        email,
        otp,
    });
}
