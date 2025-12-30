import { EMAIL_JOB_NAMES } from "src/constants/email-jobs.constants.js";

const JOB_PRIORITIES: Record<string, number> = {
    [EMAIL_JOB_NAMES.RESET_PASS_OTP]: 1,
    [EMAIL_JOB_NAMES.REGISTER_OTP]: 2,
    [EMAIL_JOB_NAMES.ACCOUNT_APPROVAL]: 5,
    [EMAIL_JOB_NAMES.ACCOUNT_BAN]: 10,
};

export default JOB_PRIORITIES;
