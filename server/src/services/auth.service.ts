import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import emailQueue from "src/bull/queues/email.queue.js";
import { addEmailJob, EMAIL_JOB_Names } from "src/bull/workers/email.worker.js";
import cacheInvalidation from "src/cache/cacheInvalidation.js";
import { cacheKeyFactory } from "src/cache/cacheKeyFactory.js";
import cacheManager from "src/cache/cacheManager.js";
import UserInvalidationService from "src/cache/UserInvalidationService.js";
import { env } from "src/configs/env.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { ROLES } from "src/constants/roles.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import CheckUserEmailAndBanned from "src/helpers/checkUserEmailAndBanned.js";
import checkUserEmailVerified from "src/helpers/checkUserEmailVerified.js";
import invalidateUserAuth from "src/helpers/invalidateUserAuth.js";
import { getUserPermissions } from "src/middlewares/custom/getUserPermissions.js";
import { PermissionModel } from "src/models/permission.model.js";
import { RolePermissionModel } from "src/models/rolePermission.model.js";
import type { RegisterSchemaInput } from "src/schemas/auth.schema.js";
import type { PermissionDTO } from "src/types/auth.type.js";
import AppError from "src/utils/AppError.js";
import logger from "src/utils/logger.js";
import { generateOtp, verifyOtpHash } from "src/utils/OtpUtils.js";
import { authRepository } from "../repositories/auth.repository.js";
import sessionService from "./session.service.js";


export const authService = {
    // ============================
    // REGISTER
    // ============================
    registerUserService: async (data: RegisterSchemaInput) => {
        const existingUser =
            await authRepository.findUserByEmailOrPhone(
                data.email,
                data.phone
            );

        if (existingUser) {
            if (existingUser.isBanned) {
                throw new AppError(
                    "Your account is banned",
                    STATUSCODE.FORBIDDEN,
                    ERROR_CODE.FORBIDDEN,
                    [{ path: 'email', message: 'Your account is banned' }]
                );
            }

            if (existingUser.phone === data.phone) {
                throw new AppError(
                    "Phone number already exists.",
                    STATUSCODE.BAD_REQUEST,
                    ERROR_CODE.DUPLICATE_RESOURCE,
                    [
                        { path: 'phone', message: 'Account with this phone number already exists' }
                    ]
                );
            }

            if (!existingUser.isEmailVerified) {
                // OTP resend flow
                const { otp, hashedOtp, expiry } = await generateOtp();
                await authRepository.updateOtpByEmail(existingUser.email, hashedOtp, expiry);
                await addEmailJob(emailQueue, EMAIL_JOB_Names.REGISTER_OTP, {
                    email: existingUser.email,
                    otp,
                });

                return {
                    message: "Account exists but email not verified. OTP resent.",
                    email: existingUser.email,
                    userId: existingUser._id,
                };
            }


            throw new AppError(
                "Account already exists. Please login.",
                STATUSCODE.CONFLICT,
                ERROR_CODE.DUPLICATE_RESOURCE,
                [
                    { path: 'email', message: 'Account with this email already exists' },
                    { path: 'phone', message: 'Account with this phone number already exists' }
                ]
            );
        }


        const roleDoc =
            await authRepository.findRoleByName(data.role);

        if (!roleDoc) {
            throw new AppError(
                "Invalid role selected",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR, [{ path: 'role', message: 'Invalid role selected' }]
            );
        }

        const { otp, hashedOtp, expiry } = await generateOtp();

        const profileData: any = {};

        if (data.role === ROLES.INSTRUCTOR.code) {
            profileData.instructorProfile = data.instructorProfile;
            profileData.isInstructorApproved = false;
        }

        if (data.role === ROLES.MANAGER.code) {
            profileData.managerProfile = data.managerProfile;
            profileData.isManagerApproved = false;
        }

        if (data.role === ROLES.SUPPORT.code) {
            profileData.supportTeamProfile = data.supportTeamProfile;
            profileData.isSupportTeamApproved = false;
        }

        const user = await authRepository.createUser({
            name: data.name,
            email: data.email,
            password: data.password,
            roleId: roleDoc._id,
            phone: data.phone,
            address: data.address,
            verifyOtp: hashedOtp,
            verifyOtpExpiry: expiry,
            ...profileData,
        });

        if (roleDoc.name === ROLES.STUDENT.code) {
            await addEmailJob(emailQueue, EMAIL_JOB_Names.REGISTER_OTP, {
                email: user.email,
                otp,
            });
        }

        return {
            message:
                roleDoc.name === ROLES.STUDENT.code
                    ? "OTP sent to your email"
                    : "Registration successful. Awaiting approval from admin",
            userId: user._id,
            email: user.email,
        };
    },
    // ============================
    // SEND REGISTER OTP
    // ============================
    sendRegisterOtpService: async (email: string) => {
        const user =
            await authRepository.findUserByEmailWithOtp(email);

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND, [{ path: 'email', message: 'User with this email does not exist' }]
            );
        }

        CheckUserEmailAndBanned(user);

        if (user.isEmailVerified) {
            throw new AppError(
                "Email is already verified",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR, [{ path: 'email', message: 'Email is already verified' }]
            );
        }

        const { otp, hashedOtp, expiry } = await generateOtp();

        user.verifyOtp = hashedOtp;
        user.verifyOtpExpiry = expiry;
        await authRepository.saveUser(user);

        await addEmailJob(emailQueue, EMAIL_JOB_Names.REGISTER_OTP, {
            email: user.email,
            otp,
        });

        await cacheManager.del(
            cacheKeyFactory.user.byId(String(user._id))
        );

        return {
            message: "OTP sent successfully",
            userId: user._id,
            email: user.email,
        };
    },
    // ============================
    // VERIFY REGISTER OTP
    // ============================
    verifyRegisterOtpService: async (email: string, otp: string) => {
        const user =
            await authRepository.findUserByEmailWithOtp(email);

        CheckUserEmailAndBanned(user);


        if (user.isEmailVerified) {
            throw new AppError(
                "Email is already verified",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR,
                [{ path: 'email', message: 'Email is already verified' }]
            );
        }

        if (
            !user.verifyOtpExpiry ||
            user.verifyOtpExpiry < new Date()
        ) {
            throw new AppError(
                "OTP expired",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR, [{ path: 'otp', message: 'OTP has expired' }]
            );
        }

        const isValidOtp =
            await verifyOtpHash(otp, user.verifyOtp);

        if (!isValidOtp) {
            throw new AppError(
                "Invalid OTP",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR, [{ path: 'otp', message: 'OTP is invalid' }]
            );
        }

        user.isEmailVerified = true;
        user.verifyOtp = undefined;
        user.verifyOtpExpiry = undefined;
        user.approvedBy = undefined;

        await authRepository.saveUser(user);

        // 4️⃣ Invalidate caches & sessions
        await Promise.all([
            cacheInvalidation.invalidateUser(String(user._id)),
            cacheInvalidation.invalidateUserSession(String(user._id)),
            UserInvalidationService.invalidateUserEverything(String(user._id)),
        ]);

        return {
            message: "Email verified successfully",
            userId: user._id,
            email: user.email,
        };
    },
    // ============================
    // LOGIN
    // ============================
    loginUserService: async (email: string, password: string) => {
        // 1️⃣ Fetch user
        const user = await authRepository.findUserForLogin(email);

        if (!user) throw new AppError("User not found", STATUSCODE.NOT_FOUND);

        // 2️⃣ Run standard checks
        CheckUserEmailAndBanned(user);
        checkUserEmailVerified(user);

        // 3️⃣ Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new AppError(
                "Invalid password",
                STATUSCODE.UNAUTHORIZED,
                ERROR_CODE.UNAUTHORIZED,
                [{ path: "password", message: "Invalid password" }]
            );
        }

        const sessionId = uuidv4();
        const rolePermissions = await RolePermissionModel
            .find({ roleId: user.roleId })
            .lean();

        const rolePermissionIds = rolePermissions.map(
            rp => rp.permissionId
        );

        // 5️⃣ Merge role + custom permission IDs
        const allPermissionIds = [
            ...new Set([
                ...rolePermissionIds.map(String),
                ...(user.permissions || []).map(String),
            ]),
        ];

        // 6️⃣ Fetch FULL permission objects
        const permissions = await PermissionModel.find({
            _id: { $in: allPermissionIds },
        }).select("_id code description").lean();



        const roleName = await authRepository.getRoleNameById(user.roleId._id);

        const permissionsDTO: PermissionDTO[] = permissions.map((p) => ({
            _id: p._id.toString(),
            code: p.code,
            description: p.description,
        }));

        // 6️⃣ Generate JWT
        const accessToken = await user.generateAccessToken(
            sessionId,
            roleName,
        );
        // 7️⃣ Create session for revocation
        await sessionService.createSession(String(user._id), sessionId);
        await sessionService.setSessionPermissions(String(user._id), permissionsDTO);

        // 8️⃣ Clear cached profile
        await cacheManager.del(cacheKeyFactory.user.byId(String(user._id)));

        return {
            message: "Login successful",
            userId: user._id,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            approvalStatus: user.approvalStatus,
            accessToken,
            roleName,
        };
    },
    // ============================
    // SEND RESET PASSWORD OTP
    // ============================
    sendResetPassOtpService: async (email: string) => {
        const user = await authRepository.findUserByEmailWithOtp(email);

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND, [{ path: 'email', message: 'User with this email does not exist' }]
            );
        }

        CheckUserEmailAndBanned(user);
        checkUserEmailVerified(user);

        const { otp, hashedOtp, expiry } = await generateOtp();

        user.verifyOtp = hashedOtp;
        user.verifyOtpExpiry = expiry;
        await authRepository.saveUser(user);

        await addEmailJob(emailQueue, EMAIL_JOB_Names.RESET_PASS_OTP, {
            email: user.email,
            otp,
        });

        // invalidate cache
        try {
            await cacheManager.del(
                cacheKeyFactory.user.byId(String(user._id))
            );
        } catch (err) {
            logger.warn("cache.del failed during sendResetPassOtpService", err);
        }

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

        // invalidate all sessions
        try {
            await invalidateUserAuth(userId);
        } catch (err) {
            logger.error(
                "Failed to delete session after password change",
                err
            );
        }

        // clear cache
        try {
            await cacheManager.del(
                cacheKeyFactory.user.byId(String(user._id))
            );
        } catch (err) {
            logger.warn(
                "cache.del failed during changePasswordService",
                err
            );
        }

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
        const user = await authRepository.findUserByEmailWithOtp(email);

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND, [{ path: 'email', message: 'User with this email does not exist' }]
            );
        }

        CheckUserEmailAndBanned(user);

        if (
            !user.verifyOtpExpiry ||
            user.verifyOtpExpiry < new Date()
        ) {
            throw new AppError(
                "OTP expired",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR, [{ path: 'otp', message: 'OTP has expired' }]
            );
        }

        const isValidOtp = await verifyOtpHash(
            otp,
            user.verifyOtp
        );

        if (!isValidOtp) {
            throw new AppError(
                "Invalid OTP",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR, [{ path: 'otp', message: 'Invalid OTP' }]
            );
        }

        user.password = newPassword;
        user.verifyOtp = undefined;
        user.verifyOtpExpiry = undefined;

        await authRepository.saveUser(user);

        // invalidate all active sessions
        try {
            await invalidateUserAuth(String(user._id));
        } catch (err) {
            logger.error(
                "Failed to invalidate sessions after reset password",
                err
            );
        }

        // clear cache
        try {
            await cacheManager.del(
                cacheKeyFactory.user.byId(String(user._id))
            );
        } catch (err) {
            logger.warn(
                "cache.del failed during verifyResetPassOtpService",
                err
            );
        }

        return {
            message:
                "Password reset successfully. Please login with your new password.",
            userId: user._id,
            email: user.email,
        };
    },
    // ============================
    // LOGOUT
    // ============================
    logoutUserService: async (refreshToken: string) => {
        if (!refreshToken) {
            throw new AppError(
                "Refresh token missing",
                STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED, [{ path: 'refreshToken', message: 'Refresh token is required for logout' }]
            );
        }

        let decoded: { userId: string };
        try {
            decoded = jwt.verify(
                refreshToken,
                env.JWT_REFRESH_TOKEN_SECRET!
            ) as { userId: string };
        } catch {
            throw new AppError(
                "Invalid refresh token",
                STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED, [{ path: 'refreshToken', message: 'Invalid refresh token' }]
            );
        }

        await invalidateUserAuth(decoded.userId);

        await cacheManager.del(
            cacheKeyFactory.user.byId(decoded.userId)
        );

        return { message: "Logout successful" };
    },
    // ============================
    // CURRENT USER
    // ============================
    getCurrentUserService: async (req: any) => {
        const userId = req.user.id;
        const cacheKey = cacheKeyFactory.user.byId(userId);

        const cached = await cacheManager.get(cacheKey);
        if (cached) return { user: cached };

        const user =
            await authRepository.findUserMinimalById(userId);

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND, [{ path: 'email', message: 'User with this email does not exist' }]
            );
        }

        const rolePerms =
            await getUserPermissions(user.roleId._id);
        const permissions = [
            ...new Set([
                ...rolePerms.permissions,
            ]),
        ];

        const responseUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            roleId: user.roleId._id,
            roleName: user.roleId.name,
            approvalStatus: user.approvalStatus,
            isEmailVerified: user.isEmailVerified,
            isBanned: user.isBanned,
            permissions,
            phone: user.phone,
        };

        await cacheManager.set(cacheKey, responseUser, 120);

        return { user: responseUser };
    },

    getSessionInfoService: async (req: any) => ({
        userId: req.user.id,
        roleId: req.user.roleId,
        roleName: req.user.roleName,
        sessionId: req.user.sessionId,
        isAuthenticated: true,
    }),
};
