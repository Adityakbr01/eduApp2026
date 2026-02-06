import { Worker } from "bullmq";
import { env } from "src/configs/env.js";
import JOB_PRIORITIES from "src/configs/job-priorities.ts.js";
import EMAIL_LIMITS from "src/configs/queueRateLimits.js";
import { bullMQConnection } from "src/configs/redis.js";
import logger from "src/utils/logger.js";
import accountApproveProcessor from "../jobs/email/accountApprove.job.js";
import accountBanProcessor from "../jobs/email/accountBan.job.js";
import registerOtpProcessor from "../jobs/email/registerOtp.job.js";
import resetPasswordOtpProcessor from "../jobs/email/resetPasswordOtp.job.js";
import marketingEmailProcessor from "../processors/email/marketingEmailProcessor.js";
import processCampaignProcessor from "../processors/email/processCampaignProcessor.js";
import { EMAIL_QUEUE_NAME } from "../queues/email.queue.js";
import { EMAIL_JOB_NAMES, type EmailJobName } from "src/constants/email-jobs.constants.js";

const EMAIL_RATE_LIMITS: Partial<Record<EmailJobName, any>> = {
    [EMAIL_JOB_NAMES.REGISTER_OTP]: EMAIL_LIMITS?.["register-otp"] ?? null,
    [EMAIL_JOB_NAMES.RESET_PASS_OTP]: EMAIL_LIMITS?.["reset-pass-otp"] ?? null,
    [EMAIL_JOB_NAMES.ACCOUNT_APPROVAL]: EMAIL_LIMITS?.["account-approval"] ?? null,
    [EMAIL_JOB_NAMES.ACCOUNT_BAN]: EMAIL_LIMITS?.["account-ban"] ?? null,
};

export async function addEmailJob(
    queue: any,
    jobName: EmailJobName,
    data: any,
    customPriority?: number
) {
    const limiter = EMAIL_RATE_LIMITS[jobName];
    const priority = customPriority ?? JOB_PRIORITIES[jobName];

    return queue.add(jobName, data, {
        ...(limiter && { limiter }),
        ...(priority !== undefined && { priority }),
    });
}

// ✅ WORKER (same)
export const emailWorker = new Worker(
    EMAIL_QUEUE_NAME,
    async job => {
        const processors: Record<string, any> = {
            [EMAIL_JOB_NAMES.REGISTER_OTP]: registerOtpProcessor,
            [EMAIL_JOB_NAMES.RESET_PASS_OTP]: resetPasswordOtpProcessor,
            [EMAIL_JOB_NAMES.ACCOUNT_APPROVAL]: accountApproveProcessor,
            [EMAIL_JOB_NAMES.ACCOUNT_BAN]: accountBanProcessor,
            "send-marketing-email": marketingEmailProcessor,
            "process-campaign": processCampaignProcessor,
        };

        const processor = processors[job.name];

        if (!processor) {
            throw new Error("Unknown job type: " + job.name);
        }

        return processor(job);
    },
    {
        connection: bullMQConnection,
        concurrency: env.BULLMQ_WORKER_CONCURRENCY,
    }
);

emailWorker.on("completed", job =>
    logger.info(`✅ Completed ${job.name}`)
);

emailWorker.on("failed", (job, err) =>
    logger.error(`❌ Failed ${job.name}:`, err)
);
