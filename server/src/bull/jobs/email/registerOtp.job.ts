import emailService, { EmailType } from "src/services/otp.service.js";


export default async function registerOtpProcessor(job: { data: { email: string; otp: string } }) {
    const { email, otp } = job.data;

    await emailService.sendEmail(EmailType.VERIFY_OTP, {
        email,
        otp,
    });
}
