import emailService, { EmailType } from "src/services/otp.service.js";


export default async function (job: any) {
    const { email } = job.data;

    await emailService.sendEmail(EmailType.USER_BAN, {
        email,
    });
}
