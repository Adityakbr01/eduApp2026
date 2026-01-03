export const QUERY_KEYS = {
    // Auth
    AUTH: {
        ME: ["auth", "me"],
        PROFILE: ["auth", "profile"],
    },

    // Users
    USERS: {
        ALL: ["users"],
        LIST: (page: number) => ["users", "list", page],
        DETAIL: (id: string) => ["users", "detail", id],
        ROLES_PERMISSIONS: ["users", "roles-permissions"],
        ALL_ROLES_PERMISSIONS: ["users", "all-roles-permissions"],
        MY_ROLES_PERMISSIONS: ["users", "my-roles-permissions"]
    },
    // Courses
    COURSES: {
        ALL: ["courses"],
        FEATURED: ["courses", "featured"],
        BY_CATEGORY: ["courses", "by-category"],
        BY_SLUG: ["courses", "by-slug"],
        BY_ID: ["courses", "by-id"],
        MANAGE: ["courses", "manage"],
        INSTRUCTOR_COURSES: ["courses", "instructor"],
        INSTRUCTOR_METRICS: ["courses", "instructor-metrics"],
        ADMIN_ALL: ["courses", "admin"],
        LIST: (page: number) => ["courses", "list", page],
        DETAIL: (id: string) => ["courses", "detail", id],
    },
    // Categories
    CATEGORIES: {
        ALL: ["categories"],
        ROOT: ["categories", "root"],
        TREE: ["categories", "tree"],
        WITH_SUBCATEGORIES: ["categories", "with-subcategories"],
        FEATURED: ["categories", "featured"],
        SUBCATEGORIES: ["categories", "subcategories"],
        BY_ID: ["categories", "by-id"],
        BY_SLUG: ["categories", "by-slug"],
    },
};
