import { v4 as uuidv4 } from "uuid";
import emailQueue from "src/bull/queues/email.queue.js";
import { addEmailJob } from "src/bull/workers/email.worker.js";
import cacheInvalidation from "src/cache/cacheInvalidation.js";
import otpCache from "src/cache/otpCache.js";
import { EMAIL_JOB_NAMES } from "src/constants/email-jobs.constants.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import CheckUserEmailAndBanned from "src/helpers/checkUserEmailAndBanned.js";
import checkUserEmailVerified from "src/helpers/checkUserEmailVerified.js";
import { PermissionModel } from "src/models/permission/permission.model.js";
import { RolePermissionModel } from "src/models/permission/rolePermission.model.js";
import type { PermissionDTO } from "src/types/auth.type.js";
import AppError from "src/utils/AppError.js";
import { generateOtp, verifyOtpHash } from "src/utils/OtpUtils.js";
import { authRepository } from "src/repositories/auth.repository.js";
import { default as sessionService, default as userCache } from "src/cache/userCache.js";
import { parseUserAgent } from "src/utils/userAgentParser.js";

export const loginService = {
    // ============================
    // LOGIN
    // ===========================
    loginUserService: async (email: string, password: string, userAgent?: string, ip?: string) => {
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

        // --- CHECK USER PREFERENCES ---
        const { default: UserPreferenceModel } = await import("src/models/userPreference.model.js");
        const preferences = await UserPreferenceModel.findOne({ userId: user._id }).lean();

        // 1. Two-Factor Authentication
        if (preferences?.security?.twoFactorEnabled) {
            const { otp, hashedOtp } = await generateOtp();

            // Store OTP in Redis (type: 'login')
            await otpCache.setOtp(user.email, hashedOtp, "login");

            const { EMAIL_TYPES } = await import("src/constants/email-types.constants.js");

            // Send OTP Email
            await addEmailJob(emailQueue, EMAIL_JOB_NAMES.LOGIN_OTP, {
                email: user.email,
                otp,
                type: EMAIL_TYPES.TWO_FACTOR_OTP // Use specific template if jobs are generic
            });

            return {
                message: "2FA Verification Required",
                requires2FA: true,
                email: user.email,
                tempToken: null // meaningful only if we used a temp jwt
            };
        }

        // 2. Login Notification
        if (preferences?.email?.loginNotification ?? true) { // Default true?
            const { EMAIL_TYPES } = await import("src/constants/email-types.constants.js");
            console.log(`[AuthService] Queueing LOGIN_ALERT for ${user.email}`);

            // Parse User Agent
            const deviceName = parseUserAgent(userAgent);


            // Fire and forget
            addEmailJob(emailQueue, EMAIL_JOB_NAMES.LOGIN_ALERT, {
                type: EMAIL_TYPES.LOGIN_ALERT,
                payload: {
                    email: user.email,
                    device: deviceName,
                    time: new Date().toLocaleString(),
                    location: ip // Using IP as location proxy for now, or just IP
                }
            }).catch(err => console.error("Failed to queue login alert", err));
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
            sessionId, roleName
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
            requires2FA: false
        };
    },

    // ============================
    // VERIFY 2FA OTP
    // ============================
    verifyLoginOtpService: async (email: string, otp: string, userAgent?: string, ip?: string) => {
        const user = await authRepository.findUserForLogin(email);
        if (!user) {
            throw new AppError("User not found", STATUSCODE.NOT_FOUND);
        }

        // Get OTP from Redis
        const otpData = await otpCache.getOtp(email, "login");

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

        // LOGIN SUCCESS - Generate Tokens

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
            sessionId, roleName
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

        await otpCache.deleteOtp(email, "login");

        // Send Login Notification for 2FA users
        const { default: UserPreferenceModel } = await import("src/models/userPreference.model.js");
        const preferences = await UserPreferenceModel.findOne({ userId: user._id }).lean();

        if (preferences?.email?.loginNotification ?? true) {
            const { EMAIL_TYPES } = await import("src/constants/email-types.constants.js");
            console.log(`[AuthService] Queueing LOGIN_ALERT for ${user.email} (2FA verified)`);

            // Parse User Agent
            const deviceName = parseUserAgent(userAgent);

            // Fire and forget
            addEmailJob(emailQueue, EMAIL_JOB_NAMES.LOGIN_ALERT, {
                type: EMAIL_TYPES.LOGIN_ALERT,
                payload: {
                    email: user.email,
                    device: deviceName,
                    time: new Date().toLocaleString(),
                    location: ip
                }
            }).catch(err => console.error("Failed to queue login alert", err));
        } else {
            console.log(`[AuthService] Login notification disabled for ${user.email}`);
        }

        return {
            message: "2FA Verified. Login successful",
            userId: user._id,
            email: user.email,
            accessToken,
            roleName,
            isEmailVerified: user.isEmailVerified,
            approvalStatus: user.approvalStatus,
            requires2FA: false
        };
    },
};
