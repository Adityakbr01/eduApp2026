import { Worker } from "bullmq";
import { env } from "src/configs/env.js";
import JOB_PRIORITIES from "src/configs/JOB_PRIORITIES.js";
import EMAIL_LIMITS from "src/configs/queueRateLimits.js";
import { bullMQConnection } from "src/configs/redis.js";
import logger from "src/utils/logger.js";
import accountApproveProcessor from "../jobs/email/accountApprove.job.js";
import accountBanProcessor from "../jobs/email/accountBan.job.js";
import registerOtpProcessor from "../jobs/email/registerOtp.job.js";
import resetPasswordOtpProcessor from "../jobs/email/resetPasswordOtp.job.js";
import { EMAIL_QUEUE_NAME } from "../queues/email.queue.js";

export const EMAIL_JOB_Names = {
    REGISTER_OTP: "register-otp",
    RESET_PASS_OTP: "reset-pass-otp",
    ACCOUNT_APPROVAL: "account-approval",
    ACCOUNT_BAN: "account-ban",
};

const EMAIL_RATE_LIMITS = {
    [EMAIL_JOB_Names.REGISTER_OTP]: EMAIL_LIMITS?.["register-otp"] || null,
    [EMAIL_JOB_Names.RESET_PASS_OTP]: EMAIL_LIMITS?.["reset-pass-otp"] || null,
    [EMAIL_JOB_Names.ACCOUNT_APPROVAL]: EMAIL_LIMITS?.["account-approval"] || null,
    [EMAIL_JOB_Names.ACCOUNT_BAN]: EMAIL_LIMITS?.["account-ban"] || null,
};

export async function addEmailJob(queue: any, jobName: string, data: any, customPriority?: number) {
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
        const processors = {
            [EMAIL_JOB_Names.REGISTER_OTP]: registerOtpProcessor,
            [EMAIL_JOB_Names.RESET_PASS_OTP]: resetPasswordOtpProcessor,
            [EMAIL_JOB_Names.ACCOUNT_APPROVAL]: accountApproveProcessor,
            [EMAIL_JOB_Names.ACCOUNT_BAN]: accountBanProcessor, // To be implemented
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
