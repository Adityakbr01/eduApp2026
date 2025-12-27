const EMAIL_LIMITS = {
    "register-otp": {
        max: 20,
        duration: 1000
    },
    "reset-pass-otp": {
        max: 10,
        duration: 1000
    },
    "account-approval": {
        max: 5,
        duration: 60000
    }
};


export default EMAIL_LIMITS;