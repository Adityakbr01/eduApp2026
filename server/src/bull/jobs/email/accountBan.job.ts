import { EMAIL_TYPES } from "src/constants/email-types.constants.js";
import emailService from "src/services/otp.service.js";


export default async function (job: any) {
    const { email } = job.data;

    await emailService.sendEmail(EMAIL_TYPES.USER_BAN, {
        email,
    });
}
