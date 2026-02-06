import emailQueue from "../../queues/email.queue.js";
import type { Types } from "mongoose";

export interface SendMarketingEmailJobData {
    campaignId: string;
    userId: string;
    email: string;
    subject: string;
    content: string;
    priority: "low" | "normal" | "high";
}

/**
 * Add a job to send a marketing email to a single user
 */
export const sendMarketingEmailJob = async (data: SendMarketingEmailJobData) => {
    // Map priority to BullMQ priority (lower number = higher priority)
    const priorityMap = {
        high: 1,
        normal: 5,
        low: 10,
    };

    return emailQueue.add("send-marketing-email", data, {
        priority: priorityMap[data.priority],
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
    });
};
