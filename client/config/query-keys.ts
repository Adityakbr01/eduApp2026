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
};
