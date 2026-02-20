export const user_roles = {
    ADMIN: "admin",
    MANAGER: "manager",
    INSTRUCTOR: "instructor",
    SUPPORT: "support_team",
    STUDENT: "student",
} as const;

export type user_Role_type = (typeof user_roles)[keyof typeof user_roles];
