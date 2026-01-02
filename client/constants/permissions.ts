const app_permissions = {
    // ---------- User Management ----------
    READ_USER: "READ_USER",           // Read any user (admin/manager)
    READ_SELF: "READ_SELF",           // Read own profile
    WRITE_USER: "WRITE_USER",         // Create new users
    UPDATE_USER: "UPDATE_USER",       // Update any user
    READ_USERS: "READ_USERS",         // Read list of users
    UPDATE_SELF: "UPDATE_SELF",       // Update own profile
    DELETE_USER: "DELETE_USER",       // Delete any user
    DELETE_SELF: "DELETE_SELF",       // Delete own account
    MANAGE_USER: "MANAGE_USER",       // High-level user management

    // ---------- Role & Permission Management ----------
    MANAGE_ROLES: "MANAGE_ROLES",             // Create/update/delete roles
    MANAGE_PERMISSIONS: "MANAGE_PERMISSIONS",// Assign/remove permissions to roles

    // ---------- Course Management ----------
    READ_COURSE: "READ_COURSE",           // Read any course
    READ_OWN_COURSE: "READ_OWN_COURSE",   // Read own courses (student)
    WRITE_COURSE: "WRITE_COURSE",         // Create course
    UPDATE_COURSE: "UPDATE_COURSE",       // Update any course
    DELETE_COURSE: "DELETE_COURSE",       // Delete any course
    MANAGE_COURSE: "MANAGE_COURSE",       // High-level course management
    ASSIGN_INSTRUCTOR: "ASSIGN_INSTRUCTOR", // Assign instructors to courses
    PUBLISH_COURSE: "PUBLISH_COURSE",     // Make course live
    UNPUBLISH_COURSE: "UNPUBLISH_COURSE", // Unpublish course

    // ---------- Enrollment ----------
    ENROLL_COURSE: "ENROLL_COURSE",       // Enroll student to course
    UNENROLL_COURSE: "UNENROLL_COURSE",   // Remove enrollment
    VIEW_ENROLLMENTS: "VIEW_ENROLLMENTS", // See enrollment stats

    // ---------- Reporting / Analytics ----------
    VIEW_REPORTS: "VIEW_REPORTS",         // See general reports
    EXPORT_REPORTS: "EXPORT_REPORTS",     // Export data as CSV/PDF
    VIEW_DASHBOARD: "VIEW_DASHBOARD",     // Access dashboard

    // ---------- System / Settings ----------
    MANAGE_SETTINGS: "MANAGE_SETTINGS",   // Change system-level settings
    MANAGE_NOTIFICATIONS: "MANAGE_NOTIFICATIONS", // Send system notifications
    VIEW_LOGS: "VIEW_LOGS",               // Access server/app logs

    // ---------- Misc / Extra ----------
    SEND_MESSAGES: "SEND_MESSAGES",       // Messaging capability
    READ_MESSAGES: "READ_MESSAGES",
    DELETE_MESSAGES: "DELETE_MESSAGES",
    UPLOAD_FILES: "UPLOAD_FILES",
    DOWNLOAD_FILES: "DOWNLOAD_FILES",
    MANAGE_TAGS: "MANAGE_TAGS",           // For categorization
} as const;

export default app_permissions;

export type AppPermission = (typeof app_permissions)[keyof typeof app_permissions];
