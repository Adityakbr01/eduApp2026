/**
 * BullMQ Configuration
 * Centralized configuration for all BullMQ queues and jobs
 */

export const QUEUE_NAMES = {
    EMAIL: "email-queue",
} as const;

export const JOB_NAMES = {
    EMAIL: {
        REGISTER_OTP: "register-otp",
        RESET_PASSWORD_OTP: "reset-password-otp",
        ACCOUNT_APPROVAL: "account-approval",
        ACCOUNT_BAN: "account-ban",
        SEND_MARKETING_EMAIL: "send-marketing-email",
        PROCESS_CAMPAIGN: "process-campaign",
    },
} as const;

export const DEFAULT_JOB_OPTIONS = {
    attempts: 3,
    backoff: {
        type: "exponential" as const,
        delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: false, // Keep for debugging
};

export const PRIORITY_LEVELS = {
    HIGH: 1,
    NORMAL: 5,
    LOW: 10,
} as const;
