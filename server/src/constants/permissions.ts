// src/constants/permissions.ts
// src/constants/permissionsWithDescriptions.ts
export const PERMISSIONS = {
    READ_USER: { code: "READ_USER", description: "Read any user (admin/manager)" },
    READ_SELF: { code: "READ_SELF", description: "Read own profile" },
    WRITE_USER: { code: "WRITE_USER", description: "Create new users" },
    UPDATE_USER: { code: "UPDATE_USER", description: "Update any user" },
    UPDATE_SELF: { code: "UPDATE_SELF", description: "Update own profile" },
    DELETE_USER: { code: "DELETE_USER", description: "Delete any user" },
    DELETE_SELF: { code: "DELETE_SELF", description: "Delete own account" },
    MANAGE_USER: { code: "MANAGE_USER", description: "High-level user management" },
    MANAGE_ROLES: { code: "MANAGE_ROLES", description: "Create/update/delete roles" },
    MANAGE_PERMISSIONS: { code: "MANAGE_PERMISSIONS", description: "Assign/remove permissions to roles" },
    READ_COURSE: { code: "READ_COURSE", description: "Read any course" },
    READ_OWN_COURSE: { code: "READ_OWN_COURSE", description: "Read own courses (student)" },
    WRITE_COURSE: { code: "WRITE_COURSE", description: "Create course" },
    UPDATE_COURSE: { code: "UPDATE_COURSE", description: "Update any course" },
    DELETE_COURSE: { code: "DELETE_COURSE", description: "Delete any course" },
    MANAGE_COURSE: { code: "MANAGE_COURSE", description: "High-level course management" },
    ASSIGN_INSTRUCTOR: { code: "ASSIGN_INSTRUCTOR", description: "Assign instructors to courses" },
    PUBLISH_COURSE: { code: "PUBLISH_COURSE", description: "Make course live" },
    UNPUBLISH_COURSE: { code: "UNPUBLISH_COURSE", description: "Unpublish course" },
    ENROLL_COURSE: { code: "ENROLL_COURSE", description: "Enroll student to course" },
    UNENROLL_COURSE: { code: "UNENROLL_COURSE", description: "Remove enrollment" },
    VIEW_ENROLLMENTS: { code: "VIEW_ENROLLMENTS", description: "See enrollment stats" },
    VIEW_REPORTS: { code: "VIEW_REPORTS", description: "See general reports" },
    EXPORT_REPORTS: { code: "EXPORT_REPORTS", description: "Export data as CSV/PDF" },
    VIEW_DASHBOARD: { code: "VIEW_DASHBOARD", description: "Access dashboard" },
    MANAGE_SETTINGS: { code: "MANAGE_SETTINGS", description: "Change system-level settings" },
    MANAGE_NOTIFICATIONS: { code: "MANAGE_NOTIFICATIONS", description: "Send system notifications" },
    VIEW_LOGS: { code: "VIEW_LOGS", description: "Access server/app logs" },
    SEND_MESSAGES: { code: "SEND_MESSAGES", description: "Messaging capability" },
    READ_MESSAGES: { code: "READ_MESSAGES", description: "Read messages" },
    DELETE_MESSAGES: { code: "DELETE_MESSAGES", description: "Delete messages" },
    UPLOAD_FILES: { code: "UPLOAD_FILES", description: "Upload files" },
    DOWNLOAD_FILES: { code: "DOWNLOAD_FILES", description: "Download files" },
    MANAGE_TAGS: { code: "MANAGE_TAGS", description: "Manage tags/categories" },
} as const;



// Type-safe helper
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]["code"];
