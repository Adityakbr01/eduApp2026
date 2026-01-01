import { env } from "src/configs/env.js";
import { Resend } from "resend";
import type { EmailType } from "src/constants/email-types.constants.js";
import { templates } from "src/constants/EmailTemplates.js";
import logger from "src/utils/logger.js";


type EmailPayload =
    | { email: string; otp?: string } // VERIFY_OTP, LOGIN_OTP
    | { email: string; name?: string } // WELCOME
    | { email: string; resetLink?: string }; // PASSWORD_RESET

// Initialize Resend client
const resend = new Resend(env.RESEND_API_KEY);


const emailService = {
    sendEmail: async (type: EmailType, payload: EmailPayload) => {
        const template = templates[type];
        if (!template) throw new Error("Invalid email type");

        const { subject, text, html } = template(payload);

        try {
            const response = await resend.emails.send({
                from: "no-reply@edulaunch.shop", // must be your verified domain
                to: payload.email,
                subject,
                html,
            });

            logger.info(`✅ Email sent to ${payload.email}:`);
            logger.info(response);
            return response;
        } catch (error) {
            logger.error(`❌ Failed to send email to ${payload.email}:`, error);
            throw error;
        }

    },
};

export default emailService;
