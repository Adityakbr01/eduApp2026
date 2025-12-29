export const ROLES = {
    ADMIN: { code: "admin", description: "Full system administrator" },
    MANAGER: { code: "manager", description: "Manages users and reports" },
    INSTRUCTOR: { code: "instructor", description: "Course instructor" },
    SUPPORT: { code: "support_team", description: "Support staff" },
    STUDENT: { code: "student", description: "End user / learner" },
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES]["code"];