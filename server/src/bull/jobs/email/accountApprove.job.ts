import emailService, { EmailType } from "src/services/otp.service.js"


export default async function accountApproveProcessor(job: any) {
    const { email } = job.data;

    await emailService.sendEmail(EmailType.USER_APPROVAL, {
        email,
    });
}
