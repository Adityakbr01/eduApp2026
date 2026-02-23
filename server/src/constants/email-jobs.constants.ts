export const EMAIL_JOB_NAMES = {
    REGISTER_OTP: "register-otp",
    RESET_PASS_OTP: "reset-pass-otp",
    ACCOUNT_APPROVAL: "account-approval",
    ACCOUNT_BAN: "account-ban",
    LOGIN_ALERT: "login-alert",
    LOGIN_OTP: "login-otp",
    VIDEO_READY: "video-ready",
    PAYMENT_SUCCESS: "payment-success",

    //Marketing Emails && Campaigns
    SEND_MARKETING_EMAIL: "send-marketing-email",
    PROCESS_CAMPAIGN: "process-campaign",
    NOTIFICATION_EMAIL: "send-notification-email",
} as const;

export type EmailJobName =
    (typeof EMAIL_JOB_NAMES)[keyof typeof EMAIL_JOB_NAMES];
