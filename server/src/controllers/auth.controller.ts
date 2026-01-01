import { clearAuthCookies } from "src/middlewares/custom/clearAuthCookies.js";
import { setAuthCookies } from "src/middlewares/custom/setAuthCookies.js";
import type { RegisterSchemaInput } from "src/schemas/auth.schema.js";
import { authService } from "src/services/auth.service.js";

import type { ChangePassBody, EmailBody, LoginBody, OtpVerifyBody, RefreshTokenBody, ResetPassBody } from "src/types/auth.type.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";

const authController = {
    registerUser: catchAsync<{}, any, RegisterSchemaInput>(async (req, res) => {
        const body = req.body;
        const result = await authService.registerUserService(body);
        sendResponse(res, 201, "User registered successfully", result);
    }),
    sendRegisterOtp: catchAsync<{}, any, EmailBody>(async (req, res) => {
        const { email } = req.body;
        const result = await authService.sendRegisterOtpService(email);
        sendResponse(res, 200, "OTP sent successfully", result);
    }),
    verifyRegisterOtp: catchAsync<{}, any, OtpVerifyBody>(async (req, res) => {
        const { email, otp } = req.body;
        const result = await authService.verifyRegisterOtpService(email, otp);
        sendResponse(res, 200, "User verified successfully", result);
    }),
    loginUser: catchAsync<{}, any, LoginBody>(async (req, res) => {
        const { email, password } = req.body;
        const result = await authService.loginUserService(email, password);
        setAuthCookies(res, result.accessToken);
        sendResponse(res, 200, "User logged in successfully", {
            userId: result.userId,
            email: result.email,
            isEmailVerified: result.isEmailVerified,
            approvalStatus: result.approvalStatus,
            accessToken: result.accessToken,
            roleName: result.roleName,
        });
    }),
    sendResetPassOtp: catchAsync<{}, any, EmailBody>(async (req, res) => {
        const { email } = req.body;
        const result = await authService.sendResetPassOtpService(email);
        sendResponse(res, 200, "Password reset otp sent to email", {
            email: result.email,
            message: result.message
        });
    }),
    verifyResetPassOtp: catchAsync<{}, any, ResetPassBody>(async (req, res) => {
        const { email, otp, newPassword } = req.body;
        const result = await authService.verifyResetPassOtpService(email, otp, newPassword);
        sendResponse(res, 200, "Password reset success", {
            email: result.email,
            message: result.message
        });
    }),
    changePassword: catchAsync<{}, any, ChangePassBody>(async (req, res) => {
        const userId = req.user!.id!;
        const { currentPassword, newPassword } = req.body;
        const result = await authService.changePasswordService(userId, currentPassword, newPassword);
        sendResponse(res, 200, "Password changed successfully", result);
    }),
    logoutUser: catchAsync<{}, any, RefreshTokenBody>(async (req, res) => {
        clearAuthCookies(res);
        const userId = req.user.id
        await authService.logoutUserService(userId);
        sendResponse(res, 200, "User logged out successfully");
    }),
    getCurrentUser: catchAsync(async (req, res) => {
        const result = await authService.getCurrentUserService(req);
        sendResponse(res, 200, "Current user fetched successfully", result);
    }),
    getSession: catchAsync(async (req, res) => {
        const result = await authService.getSessionInfoService(req);
        sendResponse(res, 200, "Session active", result);
    }),
};

export default authController;
