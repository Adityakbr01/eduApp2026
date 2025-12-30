import { EMAIL_JOB_Names } from "src/bull/workers/email.worker.js";

const JOB_PRIORITIES = {
    [EMAIL_JOB_Names.RESET_PASS_OTP]: 1,     // Sabse urgent – password reset
    [EMAIL_JOB_Names.REGISTER_OTP]: 2,       // Bahut important – login/register
    [EMAIL_JOB_Names.ACCOUNT_APPROVAL]: 5,   // Medium
    [EMAIL_JOB_Names.ACCOUNT_BAN]: 10,       // Low priority – informational
};
export default JOB_PRIORITIES;