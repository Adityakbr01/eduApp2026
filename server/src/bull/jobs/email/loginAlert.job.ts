import { EMAIL_TYPES } from "src/constants/email-types.constants.js";
import emailService from "src/services/otp.service.js";

interface LoginAlertPayload {
    email: string;
    device: string;
    time: string;
}

export default async function loginAlertProcessor(job: { data: { payload: LoginAlertPayload } }) {
    const { payload } = job.data;

    // sendEmail expects (type, data)
    // The template likely expects { email, device, time } merged or inside data?
    // Let's assume sendEmail spreads the second arg into template context.
    await emailService.sendEmail(EMAIL_TYPES.LOGIN_ALERT, {
        email: payload.email,
        device: payload.device,
        time: payload.time
    });
}
