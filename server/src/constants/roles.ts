export const ROLES = {
    ADMIN: "admin",
    MANAGER: "manager",
    INSTRUCTOR: "instructor",
    SUPPORT: "support_team",
    STUDENT: "student",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
