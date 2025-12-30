export const EMAIL_TYPES = {
    VERIFY_OTP: "VERIFY_OTP",
    LOGIN_OTP: "LOGIN_OTP",
    WELCOME: "WELCOME",
    PASSWORD_RESET_OTP: "PASSWORD_RESET_OTP",
    USER_APPROVAL: "USER_APPROVAL",
    USER_BAN: "USER_BAN",
} as const;

export type EmailType =
    (typeof EMAIL_TYPES)[keyof typeof EMAIL_TYPES];
