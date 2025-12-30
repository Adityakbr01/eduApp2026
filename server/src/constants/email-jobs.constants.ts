export const EMAIL_JOB_NAMES = {
    REGISTER_OTP: "register-otp",
    RESET_PASS_OTP: "reset-pass-otp",
    ACCOUNT_APPROVAL: "account-approval",
    ACCOUNT_BAN: "account-ban",
} as const;

export type EmailJobName =
    (typeof EMAIL_JOB_NAMES)[keyof typeof EMAIL_JOB_NAMES];
