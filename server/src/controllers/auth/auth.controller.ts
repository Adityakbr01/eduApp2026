import { clearAuthCookies } from "src/middlewares/custom/clearAuthCookies.js";
import { setAuthCookies } from "src/middlewares/custom/setAuthCookies.js";
import type { RegisterSchemaInput } from "src/schemas/auth.schema.js";
import { authService } from "src/services/auth/index.js";

import type { ChangePassBody, EmailBody, LoginBody, OtpVerifyBody, RefreshTokenBody, ResetPassBody } from "src/types/auth.type.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";
import { env } from "src/configs/env.js";

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
        const userAgent = req.headers['user-agent'] || "Unknown Device";
        const ip = req.ip || "Unknown IP";

        const result = await authService.loginUserService(email, password, userAgent, ip);

        if (result.requires2FA) {
            return sendResponse(res, 200, "2FA Required", {
                requires2FA: true,
                email: result.email
            });
        }

        setAuthCookies(res, result.accessToken!); // ! because it might be undefined if 2FA
        sendResponse(res, 200, "User logged in successfully", {
            userId: result.userId,
            email: result.email,
            isEmailVerified: result.isEmailVerified,
            approvalStatus: result.approvalStatus,
            accessToken: result.accessToken,
            roleName: result.roleName,
        });
    }),
    verifyLoginOtp: catchAsync<{}, any, OtpVerifyBody>(async (req, res) => {
        const { email, otp } = req.body;
        const userAgent = req.headers['user-agent'] || "Unknown Device";
        const ip = req.ip || "Unknown IP";

        const result = await authService.verifyLoginOtpService(email, otp, userAgent, ip);
        setAuthCookies(res, result.accessToken!);
        sendResponse(res, 200, "User logged in successfully", {
            userId: result.userId,
            email: result.email,
            accessToken: result.accessToken,
            roleName: result.roleName,
            isEmailVerified: result.isEmailVerified,
            approvalStatus: result.approvalStatus,
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
        const userId = (req.user as any).id!;
        const { currentPassword, newPassword } = req.body;
        const result = await authService.changePasswordService(userId, currentPassword, newPassword);
        sendResponse(res, 200, "Password changed successfully", result);
    }),
    logoutUser: catchAsync<{}, any, RefreshTokenBody>(async (req, res) => {
        clearAuthCookies(res);
        const userId = (req.user as any).id;
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

    // OAuth Callbacks
    oauthCallback: catchAsync(async (req, res) => {
        // req.user will contain the user object returned from oauthService via Passport
        if (!req.user) {
            return res.redirect(`${env.CLIENT_URL}/signin?error=OAuthFailed`);
        }

        const user = req.user as any; // The payload returned by handleOAuthLogin

        if (user.requires2FA) {
            // OAuth doesn't currently do 2FA, but structured for future extensions
            return res.redirect(`${env.CLIENT_URL}/signin/verify-2fa?email=${user.email}`);
        }

        setAuthCookies(res, user.accessToken);

        // Redirect to client homepage/dashboard
        return res.redirect(`${env.CLIENT_URL}/`);
    }),
};

export default authController;
