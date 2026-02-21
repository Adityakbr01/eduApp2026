import { v4 as uuidv4 } from "uuid";
import { authRepository } from "src/repositories/auth.repository.js";
import { RoleModel as RoleSchema } from "src/models/permission/role.model.js";
import UserModel from "src/models/user/user.model.js";
import { ROLES } from "src/constants/roles.js";
import { default as sessionService, default as userCache } from "src/cache/userCache.js";
import cacheInvalidation from "src/cache/cacheInvalidation.js";
import { PermissionModel } from "src/models/permission/permission.model.js";
import { RolePermissionModel } from "src/models/permission/rolePermission.model.js";
import emailQueue from "src/bull/queues/email.queue.js";
import { addEmailJob } from "src/bull/workers/email.worker.js";
import { EMAIL_JOB_NAMES } from "src/constants/email-jobs.constants.js";
import { parseUserAgent } from "src/utils/userAgentParser.js";
import CheckUserEmailAndBanned from "src/helpers/checkUserEmailAndBanned.js";
import type { PermissionDTO } from "src/types/auth.type.js";

export interface OAuthLoginParams {
    provider: "google" | "github";
    providerId: string;
    email: string;
    name: string;
    avatar?: string;
    ip: string;
    userAgent: string;
}

export const oauthService = {
    handleOAuthLogin: async (params: OAuthLoginParams) => {
        const { provider, providerId, email, name, avatar, ip, userAgent } = params;

        // 1. Check if user already exists by email
        let user = await UserModel.findOne({ email });

        if (user) {
            // Check if banned
            CheckUserEmailAndBanned(user);

            // User exists: Link the new OAuth provider if not already linked
            let updated = false;

            if (provider === "google" && !user.googleId) {
                user.googleId = providerId;
                if (!user.authProvider?.includes("google")) user.authProvider?.push("google");
                updated = true;
            } else if (provider === "github" && !user.githubId) {
                user.githubId = providerId;
                if (!user.authProvider?.includes("github")) user.authProvider?.push("github");
                updated = true;
            }

            // Always mark email as verified if logging in via trusted OAuth
            if (!user.isEmailVerified) {
                user.isEmailVerified = true;
                updated = true;
            }

            if (updated) {
                await user.save();
            }
        } else {
            // 2. User does not exist, create a new one
            // By default, OAuth users are STUDENTS
            const defaultRole = await RoleSchema.findOne({ name: ROLES.STUDENT.code }).lean();
            if (!defaultRole) throw new Error("Default Student role not found");

            user = new UserModel({
                name,
                email,
                roleId: defaultRole._id,
                isEmailVerified: true, // OAuth emails are pre-verified
                authProvider: [provider],
                ...(provider === "google" ? { googleId: providerId } : {}),
                ...(provider === "github" ? { githubId: providerId } : {}),
                profile: {
                    avatar: avatar ? { key: avatar, version: 1 } : undefined
                }
            });

            await user.save();
        }

        // --- Session and Tokens Generation ---

        // 3. Login Notification
        const { default: UserPreferenceModel } = await import("src/models/user/userPreference.model.js");
        const preferences = await UserPreferenceModel.findOne({ userId: user._id }).lean();

        if (preferences?.email?.loginNotification ?? true) {
            const { EMAIL_TYPES } = await import("src/constants/email-types.constants.js");
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
            }).catch(err => console.error("Failed to queue OAuth login alert", err));
        }

        // 4. Generate Tokens and Session
        const sessionId = uuidv4();

        const rolePermissions = await RolePermissionModel
            .find({ roleId: user.roleId })
            .select("permissionId")
            .lean();

        const rolePermissionIds = rolePermissions.map(rp => rp.permissionId.toString());

        const customPermissionIds = (user.permissions ?? []).map(String);
        const permissions = await PermissionModel.find({
            _id: { $in: [...new Set([...rolePermissionIds, ...customPermissionIds])] },
        }).select("_id code description").lean();

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

        const roleName = await authRepository.getRoleNameById(user.roleId as any); // user.roleId is ObjectId here
        const accessToken = await user.generateAccessToken(sessionId, roleName);

        // Cache updates
        await cacheInvalidation.invalidateUserEverything(String(user._id));

        await sessionService.createSession(
            String(user._id),
            sessionId,
            String(user.roleId),
            roleName
        );

        await userCache.setRolePermissions(String(user._id), rolePermissionsDTO);
        await userCache.setCustomPermissions(String(user._id), customPermissionsDTO);

        return {
            userId: user._id,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            approvalStatus: user.approvalStatus,
            accessToken,
            roleName,
        };
    }
}
