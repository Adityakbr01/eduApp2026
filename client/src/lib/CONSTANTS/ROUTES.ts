
const ROUTES = {
    HOME: "/",
    AUTH: {
        LOGIN: "/signin",
        REGISTER_NEW_STUDENT: "/signup/newStudent",
        REGISTER_NEW_INSTRUCTOR: "/signup/newInstructor",
        REGISTER_NEW_MANAGER: "/signup/newManager",
        REGISTER_NEW_SUPPORT: "/signup/newSupport",
        VERIFY_OTP: "/signup/verify-otp",
        RESET_PASSWORD: "/reset-password",
        RESET_PASSWORD_VERIFY: "/reset-password/verify",
    },

    DASHBOARD: {
        ADMIN: "/dashboard/Admin",
        INSTRUCTOR: "/dashboard/Instructor",
        SUPPORT: "/dashboard/Support",
        MANAGER: "/dashboard/Manager",
    },

};

export default ROUTES;