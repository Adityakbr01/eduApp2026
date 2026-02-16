import type { Job } from "bullmq";
import { Resend } from "resend";
import { env } from "src/configs/env.js";
import logger from "src/utils/logger.js";

const resend = new Resend(env.RESEND_API_KEY);

interface NotificationEmailJobData {
    to: string;
    subject: string;
    template: string;
    context: {
        title: string;
        message: string;
        link: string;
        name: string;
    };
}

const getHtmlContent = (context: NotificationEmailJobData["context"]) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
            .header { background-color: #f8f9fa; padding: 15px; text-align: center; border-bottom: 1px solid #eee; }
            .content { padding: 20px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>${context.title}</h2>
            </div>
            <div class="content">
                <p>Hello ${context.name},</p>
                <p>${context.message}</p>
                <a href="${context.link}" class="button">View Notification</a>
            </div>
            <div class="footer">
                <p>You received this email because you have high priority notifications pending.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export default async function notificationEmailProcessor(job: Job<NotificationEmailJobData>) {
    const { to, subject, context } = job.data;

    try {
        const html = getHtmlContent(context);

        await resend.emails.send({
            from: "notifications@edulaunch.shop",
            to,
            subject,
            html,
        });

        logger.info(`✅ Notification email sent to ${to}`);
        return { success: true, to };
    } catch (error) {
        logger.error(`❌ Failed to send notification email to ${to}:`, error);
        throw error;
    }
}
