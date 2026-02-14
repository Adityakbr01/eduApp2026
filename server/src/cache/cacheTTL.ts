// =====================
// CACHE TTL CONSTANTS
// =====================
// All values in seconds

export const TTL = {
    // =====================
    // TIME UNITS
    // =====================
    ONE_MIN: 60,
    FIVE_MIN: 300,
    TEN_MIN: 600,
    FIFTEEN_MIN: 900,
    THIRTY_MIN: 1800,
    ONE_HOUR: 3600,
    TWO_HOURS: 7200,
    SIX_HOURS: 21600,
    TWELVE_HOURS: 43200,
    ONE_DAY: 86400,
    ONE_WEEK: 604800,

    // =====================
    // USER RELATED
    // =====================
    USER_PROFILE: 300,          // 5 minutes
    USER_LIST: 60,              // 1 minute
    USER_PERMISSIONS: 1800,     // 30 minutes
    USER_ACTIVITY: 300,         // 5 minutes

    // =====================
    // SESSION RELATED
    // =====================
    SESSION: 86400,             // 1 day (aligned with JWT refresh)
    SESSION_SHORT: 3600,        // 1 hour

    // =====================
    // ROLE & PERMISSIONS
    // =====================
    ROLE_PERMISSIONS: 3600,     // 1 hour - roles change rarely
    ALL_ROLES: 3600,            // 1 hour

    // =====================
    // OTP & VERIFICATION
    // =====================
    OTP: 300,                   // 5 minutes
    OTP_RATE_LIMIT: 60,         // 1 minute between OTP requests
    EMAIL_VERIFICATION: 86400,  // 1 day

    // =====================
    // RATE LIMITING
    // =====================
    RATE_LIMIT_WINDOW: 60,      // 1 minute window
    RATE_LIMIT_BLOCK: 900,      // 15 minute block
    LOGIN_ATTEMPTS: 300,        // 5 minutes

    // =====================
    // COURSES
    // =====================
    COURSE_LIST: 30,            // 30 seconds
    COURSE_DETAIL: 120,         // 2 minutes
    COURSE_ENROLLMENT: 300,     // 5 minutes

    // =====================
    // BATCH
    // =====================
    BATCH_STRUCTURE: 86400,     // 24 hours
    BATCH_PROGRESS: 604800,     // 7 days
    DATA_TTL: 86400,            // 24 hours
    USER_TTL: 604800,           // 7 days

    // =====================
    // LOCKS
    // =====================
    LOCK_SHORT: 10,             // 10 seconds
    LOCK_MEDIUM: 30,            // 30 seconds
    LOCK_LONG: 60,              // 1 minute

    // =====================
    // MISC
    // =====================
    HEALTH_CHECK: 5,            // 5 seconds
    TEMP_DATA: 300,             // 5 minutes
} as const;

// Type for TTL keys
export type TTLKey = keyof typeof TTL;
