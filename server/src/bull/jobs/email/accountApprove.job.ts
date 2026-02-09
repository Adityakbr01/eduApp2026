import { EMAIL_TYPES } from "src/constants/email-types.constants.js";
import emailService from "src/services/auth/otp.service.js"


export default async function accountApproveProcessor(job: any) {
    const { email } = job.data;

    await emailService.sendEmail(EMAIL_TYPES.USER_APPROVAL, {
        email,
    });
}
