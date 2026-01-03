const app_info = {
    name: "EduApp",
    version: "1.0.0",
    description: "An educational platform for learning and collaboration.",

    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3000,

    author: "EduApp Team",
    license: "MIT",

    primaryColor: "#EF3F4F4",
    secondaryColor: "#36656B",

    features: [
        "User authentication & authorization",
        "Role-based access control (RBAC)",
        "Course management",
        "User management",
        "Permissions system",
        "Search & filtering",
    ],

    security: {
        authentication: "JWT",
        authorization: "Roles & Permissions",
    },

    support: {
        email: "support@eduapp.com",
        website: "https://eduapp.com",
    },

    timestamps: {
        startedAt: new Date().toISOString(),
    },
};


export default app_info;