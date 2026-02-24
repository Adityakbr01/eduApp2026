import { env } from "src/configs/env.js";
import { Resend } from "resend";
import type { EmailType } from "src/constants/email-types.constants.js";
import { templates } from "src/constants/EmailTemplates.js";
import logger from "src/utils/logger.js";


type EmailPayload =
    | { email: string; otp?: string } // VERIFY_OTP, LOGIN_OTP
    | { email: string; name?: string } // WELCOME
    | { email: string; resetLink?: string } // PASSWORD_RESET
    | { email: string; device?: string; time?: string }; // LOGIN_ALERT


// Initialize Resend client
const resend = new Resend(env.RESEND_API_KEY);


const emailService = {
    sendEmail: async (type: EmailType, payload: EmailPayload) => {
        const template = templates[type];
        if (!template) throw new Error("Invalid email type");

        const { subject, text, html } = template(payload);
        const recipient = (payload as any).email || (payload as any).to;

        if (!recipient) {
            logger.error(`❌ No recipient email found for type: ${type}`, { payload });
            throw new Error("Recipient email is missing");
        }

        try {
            const response = await resend.emails.send({
                from: "no-reply@edulaunch.shop", // must be your verified domain
                to: recipient,
                subject,
                html,
            });
            return response;
        } catch (error) {
            logger.error(`❌ Failed to send email to ${payload.email}:`, error);
            throw error;
        }

    },
};

export default emailService;
