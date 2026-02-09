import emailQueue from "src/bull/queues/email.queue.js";
import { addEmailJob } from "src/bull/workers/email.worker.js";
import cacheInvalidation from "src/cache/cacheInvalidation.js";
import otpCache from "src/cache/otpCache.js";
import { EMAIL_JOB_NAMES } from "src/constants/email-jobs.constants.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import CheckUserEmailAndBanned from "src/helpers/checkUserEmailAndBanned.js";
import checkUserEmailVerified from "src/helpers/checkUserEmailVerified.js";
import AppError from "src/utils/AppError.js";
import { generateOtp, verifyOtpHash } from "src/utils/OtpUtils.js";
import { authRepository } from "src/repositories/auth.repository.js";

export const passwordService = {
    // ============================
    // SEND RESET PASSWORD OTP
    // ============================
    sendResetPassOtpService: async (email: string) => {
        const user = await authRepository.findUserByEmail(email);

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND, [{ path: 'email', message: 'User with this email does not exist' }]
            );
        }

        CheckUserEmailAndBanned(user);
        checkUserEmailVerified(user);

        const { otp, hashedOtp } = await generateOtp();

        // Store OTP in Redis
        await otpCache.setOtp(user.email, hashedOtp, "resetPassword");

        await addEmailJob(emailQueue, EMAIL_JOB_NAMES.RESET_PASS_OTP, {
            email: user.email,
            otp,
        });

        return {
            message: "Password reset otp sent successfully",
            userId: user._id,
            email: user.email,
        };
    },
    // ============================
    // CHANGE PASSWORD
    // ============================
    changePasswordService: async (
        userId: string,
        currentPassword: string,
        newPassword: string
    ) => {
        const user =
            await authRepository.findUserByIdWithPassword(userId);

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND, [{ path: 'email', message: 'User with this email does not exist' }]
            );
        }

        CheckUserEmailAndBanned(user);

        const isPasswordValid =
            await user.comparePassword(currentPassword);

        if (!isPasswordValid) {
            throw new AppError(
                "Current password is incorrect",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR, [{ path: 'currentPassword', message: 'Current password is incorrect' }]
            );
        }

        user.password = newPassword;
        await authRepository.saveUser(user);

        await cacheInvalidation.invalidateUserEverything(String(user._id));

        return {
            message:
                "Password changed successfully. Please login again.",
            userId: user._id,
            email: user.email
        };
    },
    // ============================
    // VERIFY RESET PASSWORD OTP
    // ============================
    verifyResetPassOtpService: async (
        email: string,
        otp: string,
        newPassword: string
    ) => {
        const user = await authRepository.findUserByEmailWithPassword(email);

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND, [{ path: 'email', message: 'User with this email does not exist' }]
            );
        }

        CheckUserEmailAndBanned(user);

        // Get OTP from Redis
        const otpData = await otpCache.getOtp(email, "resetPassword");

        if (!otpData) {
            throw new AppError(
                "OTP expired or not found",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR, [{ path: 'otp', message: 'OTP has expired or not found' }]
            );
        }

        const isValidOtp = await verifyOtpHash(otp, otpData.hashedOtp);

        if (!isValidOtp) {
            throw new AppError(
                "Invalid OTP",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR, [{ path: 'otp', message: 'Invalid OTP' }]
            );
        }

        user.password = newPassword;

        await authRepository.saveUser(user);
        await otpCache.deleteOtp(email, "resetPassword");
        await cacheInvalidation.invalidateUserEverything(String(user._id));

        return {
            message:
                "Password reset successfully. Please login with your new password.",
            userId: user._id,
            email: user.email,
        };
    },
};
