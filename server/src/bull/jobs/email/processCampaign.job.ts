import emailQueue from "../../queues/email.queue.js";

export interface ProcessCampaignJobData {
    campaignId: string;
    priority: "low" | "normal" | "high";
}

/**
 * Add a job to process an entire email campaign
 * This will fetch recipients and dispatch individual email jobs
 */
export const processCampaignJob = async (data: ProcessCampaignJobData) => {
    const priorityMap = {
        high: 1,
        normal: 5,
        low: 10,
    };

    return emailQueue.add("process-campaign", data, {
        priority: priorityMap[data.priority],
        attempts: 2,
        backoff: {
            type: "fixed",
            delay: 10000,
        },
    });
};
