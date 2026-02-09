// =====================
// CACHE KEY FACTORY
// =====================
// Centralized cache key generation for consistency

export const cacheKeyFactory = {
    // =====================
    // USER KEYS
    // =====================
    user: {
        byId: (id: string) => `user:id:${id}`,
        byEmail: (email: string) => `user:email:${email}`,
        activity: (id: string) => `user:activity:${id}`,
        all: () => `users:all`,
        permissions: (userId: string) => `user:permissions:${userId}`,
        paginated: (
            page: number,
            limit: number,
            search: string = "",
            roleId: string = ""
        ) => {
            const s = search || "";
            const r = roleId || "";
            return `users:page=${page}:limit=${limit}:search=${s}:role=${r}`;
        },
    },

    // =====================
    // SESSION KEYS
    // =====================
    session: {
        byUserId: (userId: string) => `session:user:${userId}`,
        bySessionId: (sessionId: string) => `session:id:${sessionId}`,
    },

    // =====================
    // ROLE KEYS
    // =====================
    role: {
        byId: (roleId: string) => `role:id:${roleId}`,
        byName: (name: string) => `role:name:${name}`,
        permissions: (roleId: string) => `role:permissions:${roleId}`,
        all: () => `role:permissions:all`,
    },

    // =====================
    // PERMISSION KEYS
    // =====================
    permissions: {
        byUserId: (userId: string, type: "role" | "custom" | "effective") =>
            `permissions:user:${userId}:${type}`,
        byRoleId: (roleId: string) => `permissions:role:${roleId}`,
        all: () => `permissions:all`,
        extra: (objectIds: string[]) => `permissions:extra:${objectIds.map(id => id.toString()).sort().join(",")}`
    },

    // =====================
    // PATTERN KEYS (for bulk operations)
    // =====================
    users: {
        PAGINATED_USERS_PATTERN: "users:page=*",
        USER_PERMISSIONS_PATTERN: "user:permissions:*",
        ALL_USERS_PATTERN: "users:*",
        ROLE_PERMISSIONS_PATTERN: "role:permissions:*",
        SESSION_PATTERN: "session:user:*",
        PERMISSIONS_PATTERN: "permissions:*",
        paginated: (
            page: number,
            limit: number,
            search: string = "",
            roleId: string = ""
        ) => {
            const s = search || "";
            const r = roleId || "";
            return `users:page=${page}:limit=${limit}:search=${s}:role=${r}`;
        },
    },

    // =====================
    // OTP KEYS
    // =====================
    otp: {
        register: (email: string) => `otp:register:${email}`,
        resetPassword: (email: string) => `otp:reset:${email}`,
        verify: (email: string) => `otp:verify:${email}`,
        login: (email: string) => `otp:login:${email}`,
    },

    // =====================
    // RATE LIMITING KEYS
    // =====================
    rateLimit: {
        byIp: (ip: string, endpoint: string) => `ratelimit:${endpoint}:${ip}`,
        byUserId: (userId: string, endpoint: string) => `ratelimit:${endpoint}:user:${userId}`,
        login: (identifier: string) => `ratelimit:login:${identifier}`,
        otp: (email: string) => `ratelimit:otp:${email}`,
    },

    // =====================
    // LOCK KEYS (for distributed locking)
    // =====================
    lock: {
        user: (userId: string, action: string) => `lock:user:${userId}:${action}`,
        email: (email: string) => `lock:email:${email}`,
        process: (processName: string) => `lock:process:${processName}`,
    },

    // =====================
    // COURSE KEYS (for future use)
    // =====================
    course: {
        byId: (courseId: string) => `course:id:${courseId}`,
        all: () => `courses:all`,
        paginated: (page: number, limit: number, filters: string = "") =>
            `courses:page=${page}:limit=${limit}:filters=${filters}`,
        enrollments: (courseId: string) => `course:enrollments:${courseId}`,
        userEnrollments: (userId: string) => `user:enrollments:${userId}`,
    },
};