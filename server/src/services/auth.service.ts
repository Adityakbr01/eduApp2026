import { v4 as uuidv4 } from "uuid";

import emailQueue from "src/bull/queues/email.queue.js";
import { addEmailJob } from "src/bull/workers/email.worker.js";
import cacheInvalidation from "src/cache/cacheInvalidation.js";
import otpCache from "src/cache/otpCache.js";
import { EMAIL_JOB_NAMES } from "src/constants/email-jobs.constants.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { ROLES } from "src/constants/roles.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import CheckUserEmailAndBanned from "src/helpers/checkUserEmailAndBanned.js";
import checkUserEmailVerified from "src/helpers/checkUserEmailVerified.js";
import { PermissionModel } from "src/models/permission.model.js";
import { RolePermissionModel } from "src/models/rolePermission.model.js";
import type { RegisterSchemaInput } from "src/schemas/auth.schema.js";
import type { PermissionDTO } from "src/types/auth.type.js";
import AppError from "src/utils/AppError.js";
import { generateOtp, verifyOtpHash } from "src/utils/OtpUtils.js";
import { authRepository } from "../repositories/auth.repository.js";
import sessionService from "../cache/userCache.js";
import userCache from "../cache/userCache.js";


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
                const { otp, hashedOtp } = await generateOtp();
                // Store OTP in Redis
                await otpCache.setOtp(existingUser.email, hashedOtp, "register");
                await addEmailJob(emailQueue, EMAIL_JOB_NAMES.REGISTER_OTP, {
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

        const { otp, hashedOtp } = await generateOtp();

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
            ...profileData,
        });

        // Store OTP in Redis
        await otpCache.setOtp(user.email, hashedOtp, "register");

        if (roleDoc.name === ROLES.STUDENT.code) {
            await addEmailJob(emailQueue, EMAIL_JOB_NAMES.REGISTER_OTP, {
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
            await authRepository.findUserByEmail(email);

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

        const { otp, hashedOtp } = await generateOtp();

        // Store OTP in Redis
        await otpCache.setOtp(user.email, hashedOtp, "register");

        await addEmailJob(emailQueue, EMAIL_JOB_NAMES.REGISTER_OTP, {
            email: user.email,
            otp,
        });

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
            await authRepository.findUserByEmail(email);

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
                ERROR_CODE.VALIDATION_ERROR,
                [{ path: 'email', message: 'Email is already verified' }]
            );
        }

        // Get OTP from Redis
        const otpData = await otpCache.getOtp(email, "register");

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
                ERROR_CODE.VALIDATION_ERROR, [{ path: 'otp', message: 'OTP is invalid' }]
            );
        }

        // Update user and delete OTP from Redis
        user.isEmailVerified = true;
        user.approvedBy = undefined;

        await authRepository.saveUser(user);
        await otpCache.deleteOtp(email, "register");
        await cacheInvalidation.invalidateUserEverything(String(user._id));

        return {
            message: "Email verified successfully",
            userId: user._id,
            email: user.email,
        };
    },
    // ============================
    // LOGIN
    // ===========================
    loginUserService: async (email: string, password: string) => {
        const user = await authRepository.findUserForLogin(email);
        if (!user) {
            throw new AppError("User not found", STATUSCODE.NOT_FOUND);
        }

        CheckUserEmailAndBanned(user);
        checkUserEmailVerified(user);

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
            .select("permissionId")
            .lean();

        const rolePermissionIds = rolePermissions.map(rp =>
            rp.permissionId.toString()
        );

        const customPermissionIds = (user.permissions ?? []).map(String);
        const permissions = await PermissionModel.find({
            _id: { $in: [...new Set([...rolePermissionIds, ...customPermissionIds])] },
        })
            .select("_id code description")
            .lean();

        const rolePermissionSet = new Set(rolePermissionIds);

        const rolePermissionsDTO: PermissionDTO[] = [];
        const customPermissionsDTO: PermissionDTO[] = [];

        for (const perm of permissions) {
            const dto: PermissionDTO = {
                _id: perm._id.toString(),
                code: perm.code,
                description: perm.description,
            };

            if (rolePermissionSet.has(perm._id.toString())) {
                rolePermissionsDTO.push(dto);
            } else {
                customPermissionsDTO.push(dto);
            }
        }

        const roleName = await authRepository.getRoleNameById(
            user.roleId._id
        );

        const accessToken = await user.generateAccessToken(
            sessionId,
            roleName
        );

        await cacheInvalidation.invalidateUserEverything(String(user._id));

        await sessionService.createSession(
            String(user._id),
            sessionId,
            String(user.roleId._id),
            roleName
        );

        await userCache.setRolePermissions(
            String(user._id),
            rolePermissionsDTO
        );

        await userCache.setCustomPermissions(
            String(user._id),
            customPermissionsDTO
        );

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
    // ============================
    // LOGOUT
    // ============================
    logoutUserService: async (userId: string) => {
        await cacheInvalidation.invalidateUserEverything(userId);
        return { message: "Logout successful" };
    },
    // ============================
    // CURRENT USER
    // ============================
    getCurrentUserService: async (req: any) => {
        const userId = req.user.id;
        const cachedUser = await sessionService.getUserProfile(userId);
        if (cachedUser) {
            return { user: cachedUser };
        }

        const user =
            await authRepository.findUserMinimalById(userId);

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND, [{ path: 'email', message: 'User with this email does not exist' }]
            );
        }

        const customPermissions = await userCache.getCustomPermissions(String(user._id));
        const rolePermissions = await userCache.getRolePermissions(String(user._id));
        const EffectivePermissions = await userCache.getEffectivePermissions(String(user._id));

        const responseUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            roleId: user.roleId._id,
            roleName: user.roleId.name,
            approvalStatus: user.approvalStatus,
            isEmailVerified: user.isEmailVerified,
            isBanned: user.isBanned,
            customPermissions,
            rolePermissions,
            EffectivePermissions,
            phone: user.phone,
        };

        await sessionService.createUserProfile(userId, responseUser);

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
