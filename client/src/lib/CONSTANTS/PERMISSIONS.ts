export const PERMISSIONS = {
    COURSE_CREATE: "course:create",  // e.g create a new course
    COURSE_READ: "course:read",      // e.g view course content
    COURSE_UPDATE: "course:update",  // e.g update course content
    COURSE_DELETE: "course:delete", // e.g delete course entirely
    COURSE_MANAGE: "course:manage", // e.g create coupons, manage settings, etc.
    COURSE_ENROLL: "course:enroll", // e.g enroll in a course

    PAYMENT_PROCESS: "payment:process", // e.g process payments
    PAYMENT_REFUND: "payment:refund",   // e.g issue refunds
    PAYMENT_VIEW: "payment:view",       // e.g view payment details
    PAYMENT_HISTORY: "payment:history", // e.g view payment history
    PAYMENT_MANAGE: "payment:manage",   // e.g manage payment settings


    USER_CREATE: "user:create",   // e.g create a new user
    USER_READ: "user:read",      // e.g view user profile
    USER_UPDATE: "user:update",  // e.g update user profile
    USER_DELETE: "user:delete",  // e.g delete user account
    USER_MANAGE: "user:manage", // e.g manage user roles, permissions, etc.
    USER_BAN: "user:ban",       // e.g ban a user

    STUDENT_READ: "student:read",      // e.g view student profile
    STUDENT_SUPPORT: "student:support", // e.g provide support to students

    SELF_READ: "self:read",    // e.g view own profile
    SELF_UPDATE: "self:update", // e.g update own profile
    SELF_DELETE: "self:delete", // e.g delete own account
} as const;

export type AppPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
