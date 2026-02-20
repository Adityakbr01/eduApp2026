
const links = {
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
        EMAIL_NOT_VERIFIED: "/email-not-verified",
    },

    DASHBOARD: {
        ADMIN: "/dashboard/Admin",
        INSTRUCTOR: "/dashboard/Instructor",
        SUPPORT: "/dashboard/Support",
        MANAGER: "/dashboard/Manager",
    },

    S3:{
        S3_BASE_URL:"https://eduapp2026-s3-bucket.s3.us-east-1.amazonaws.com/",
        UPLOAD_TEST: "/s3/upload-test",
        GET_FILE_TEST: "/s3/get-file-test",
        
    }

};

export default links;