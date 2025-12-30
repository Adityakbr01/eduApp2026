import { env } from "src/configs/env.js";
import { Resend } from "resend";
import { templates } from "src/constants/EmailTemplates.js";

export enum EmailType {
    VERIFY_OTP = "VERIFY_OTP",
    LOGIN_OTP = "LOGIN_OTP",
    WELCOME = "WELCOME",
    PASSWORD_RESET_OTP = "PASSWORD_RESET_OTP",
    USER_APPROVAL = "USER_APPROVAL",
    USER_BAN = "USER_BAN",
}


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

            console.log(`✅ Email sent to ${payload.email}:`);
        } catch (error) {
            console.error(`❌ Failed to send email to ${payload.email}:`, error);
            throw error;
        }

    },
};

export default emailService;
