import { Types } from "mongoose";

import emailQueue from "src/bull/queues/email.queue.js";
import { addEmailJob } from "src/bull/workers/email.worker.js";
import userCache from "src/cache/userCache.js";
import userCacheService from "src/cache/usersCache.js";
import { EMAIL_JOB_NAMES } from "src/constants/email-jobs.constants.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { attachPermissionsToUser, type RolePermissionCache } from "src/helpers/attachUserPermissionHelper.js";
import { RoleModel } from "src/models/permission/role.model.js";
import UserModel from "src/models/user/user.model.js";
import { authRepository } from "src/repositories/auth.repository.js";
import { approvalStatusEnum } from "src/types/user.model.type.js";
import AppError from "src/utils/AppError.js";
import logger from "src/utils/logger.js";


const userService = {
    // ============================
    // GET ALL USERS (PAGINATED)
    // ============================
    getAllUsers: async (reqQuery: {
        page?: number;
        limit?: number;
        search?: string;
        roleId?: string;
    }) => {
        let { page = 1, limit = 10, search = "", roleId = "" } = reqQuery;

        page = Math.max(1, Number(page));
        limit = Math.max(1, Number(limit));

        const skip = (page - 1) * limit;

        const query: Record<string, any> = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        if (roleId) {
            query.roleId = roleId;
        }

        // Try cache first (stale-while-revalidate pattern)
        const cacheResult = await userCacheService.getPaginatedUsers({
            page,
            limit,
            search,
            roleId,
        });

        if (cacheResult.hit && cacheResult.data && !cacheResult.stale) {
            return {
                message: "Users fetched successfully (cached)",
                users: cacheResult.data.users,
                pagination: cacheResult.data.pagination,
                success: true,
            };
        }

        const [users, totalUsers] = await Promise.all([
            UserModel.find(query)
                .populate("roleId")
                .skip(skip)
                .limit(limit)
                .lean(),
            UserModel.countDocuments(query),
        ]);

        if (!users.length) {
            throw new AppError(
                "No users found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
                [{ path: "users", message: "No users available in the database" }]
            );
        }

        const pagination = {
            total: totalUsers,
            page,
            limit,
            totalPages: Math.ceil(totalUsers / limit),
            hasNext: page < Math.ceil(totalUsers / limit),
            hasPrev: page > 1,
        };

        const rolePermissionsCache: RolePermissionCache = new Map();
        const usersWithPermissions = await Promise.all(
            users.map((user) => attachPermissionsToUser(user, rolePermissionsCache))
        );


        // Cache result (fire and forget)
        userCacheService
            .setPaginatedUsers(
                { page, limit, search, roleId },
                { users: usersWithPermissions, pagination }
            )
            .catch((err) => logger.warn("cache.set failed:", err));

        return {
            message: "Users fetched successfully",
            users: usersWithPermissions,
            pagination,
        };
    },
    // ============================
    // GET MY ROLE & PERMISSIONS
    // ============================
    getMyRoleANDPermission: async (userId: string) => {
        const user = await authRepository.findUserMinimalById(userId);

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
                [{ path: "user", message: "No user found with the given ID" }]
            );
        }

        const rolePermissions = await userCache.getRolePermissions(userId);
        const customPermissions = await userCache.getCustomPermissions(userId);
        const effectivePermissions = await userCache.getEffectivePermissions(userId);

        return {
            message: "User fetched successfully",
            rolePermissions,
            customPermissions,
            effectivePermissions,
        };
    },
    // ============================
    // DELETE USER BY ID
    // ============================
    deleteUserById: async (userId: string, deletedBy: string) => {
        const user = await UserModel.findById(userId).exec();

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
                [{ path: "user", message: "No user found with the given ID" }]
            );
        }

        if (deletedBy.toString() === userId.toString()) {
            throw new AppError(
                "You cannot delete your own account",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN,
                [{ path: "user", message: "Users cannot delete their own account" }]
            );
        }

        const isAdmin = await authRepository.isAdminUser(user);

        if (isAdmin) {
            throw new AppError(
                "Cannot delete an admin user",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN,
                [{ path: "user", message: "Cannot delete an admin user" }]
            );
        }

        await UserModel.findByIdAndDelete(userId).exec();

        await Promise.all([
            userCacheService.invalidateUser(userId),
            userCacheService.invalidateUserEverything(userId),
        ]);

        return {
            message: "User deleted successfully",
            data: user,
        };
    },
    // ============================
    // GET ALL ROLES & PERMISSIONS
    // ============================
    getAllRoleANDPermission: async () => {
        const cached = await userCacheService.getAllRoles();

        if (cached) {
            return {
                message: "Roles and permissions fetched successfully (cached)",
                data: cached,
            };
        }

        const rolesWithPermissions = await RoleModel.aggregate([
            {
                $lookup: {
                    from: "rolepermissions",
                    localField: "_id",
                    foreignField: "roleId",
                    as: "rolePermissions",
                },
            },
            {
                $lookup: {
                    from: "permissions",
                    localField: "rolePermissions.permissionId",
                    foreignField: "_id",
                    as: "permissions",
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    permissions: { _id: 1, code: 1, description: 1 },
                },
            },
        ]);

        if (!rolesWithPermissions || rolesWithPermissions.length === 0) {
            throw new AppError(
                "No roles found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
                [{ path: "roles", message: "No roles found in the database" }]
            );
        }

        userCacheService
            .setAllRoles(rolesWithPermissions)
            .catch((err) => logger.warn("cache.set failed in getRolesAndPermissions:", err));

        return {
            message: "Roles and permissions fetched successfully",
            data: rolesWithPermissions,
        };
    },
    // ============================
    // ASSIGN PERMISSIONS TO USER
    // ============================
    assignPermissions: async (data: { userId: string; permission: string }, assignBy: string) => {
        const { userId, permission } = data;

        const user = await authRepository.findUserById(userId);

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
                [{ path: "user", message: "No user found with the given ID" }]
            );
        }
        if (userId.toString() === assignBy.toString()) {
            throw new AppError(
                "Permission assignment denied",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN,
                [{ path: "user", message: "You cannot assign permissions to yourself" }]
            );
        }
        // Add permission to user
        if (!user.permissions) {
            user.permissions = [];
        }
        if (user.permissions.includes(permission)) {
            throw new AppError(
                "Permission already assigned",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.PERMISSION_ALREADY_ASSIGNED,
                [{ path: "permission", message: "This permission is already assigned to the user" }]
            );
        }
        // Add permission to user
        user.permissions.push(permission);
        await user.save();

        await Promise.all([
            userCacheService.invalidateUser(userId),
            userCacheService.invalidateUserEverything(userId),
        ]);

        return {
            message: "Permission assigned successfully",
            data: user,
        };
    },
    // ============================
    // delete PERMISSIONS TO USER
    // ============================
    deletePermissions: async (data: { userId: string; permission: string }, deleteBy: string) => {
        const { userId, permission } = data;
        const user = await authRepository.findUserById(userId);

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
                [{ path: "user", message: "No user found with the given ID" }]
            );
        }
        if (userId.toString() === deleteBy.toString()) {
            throw new AppError(
                "Permission deletion denied",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.PERMISSION_DENIED,
                [{ path: "user", message: "You cannot delete permissions from yourself" }]
            );
        }
        // Remove permission from user
        if (!user.permissions || !user.permissions.includes(permission)) {
            throw new AppError(
                "Permission not found",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.PERMISSION_NOT_FOUND,
                [{ path: "permission", message: "This permission is not assigned to the user" }]
            );
        }
        user.permissions = user.permissions.filter((perm) => perm.toString() !== permission.toString());
        await user.save();

        await Promise.all([
            userCacheService.invalidateUser(userId),
            userCacheService.invalidateUserEverything(userId),
        ]);

        return {
            message: "Permission deleted successfully",
            data: user,
        };
    },
    // ============================
    // APPROVE USER
    // ============================
    approveUser: async (userId: string, approvedBy: string) => {
        const user = await authRepository.findUserById(userId);

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
                [{ path: "user", message: "No user found with the given ID" }]
            );
        }

        if (user.approvalStatus === approvalStatusEnum.APPROVED) {
            throw new AppError(
                "User is already approved",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.ACCOUNT_ALREADY_APPROVED,
                [{ path: "user", message: "The user account is already approved" }]
            );
        }

        if (userId.toString() === approvedBy.toString()) {
            throw new AppError(
                "User approval denied",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN,
                [{ path: "user", message: "You cannot approve your own account" }]
            );
        }

        await addEmailJob(emailQueue, EMAIL_JOB_NAMES.ACCOUNT_APPROVAL, {
            to: user.email,
        });

        user.approvalStatus = approvalStatusEnum.APPROVED;
        user.approvedBy = new Types.ObjectId(approvedBy);
        await user.save();

        await Promise.all([
            userCacheService.invalidateUser(userId),
            userCacheService.invalidateUserEverything(userId),
        ]);

        return {
            message: "User approved successfully",
            data: user,
        };
    },
    // ============================
    // TOGGLE USER STATUS (BAN/UNBAN)
    // ============================
    toggleUserStatus: async (
        userId: string,
        actionBy: string,
        options?: { banEmail?: boolean }
    ) => {
        const user = await authRepository.findUserById(userId);

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
                [{ path: "user", message: "No user found with the given ID" }]
            );
        }

        const isAdmin = await authRepository.isAdminUser(user);

        if (isAdmin) {
            throw new AppError(
                "Cannot ban/unban an admin user",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN,
                [{ path: "user", message: "Cannot ban/unban an admin user" }]
            );
        }

        if (userId === actionBy) {
            throw new AppError(
                "You cannot perform this action on your own account",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN,
                [{ path: "user", message: "Cannot perform action on own account" }]
            );
        }

        const isBanning = !user.isBanned;

        if (isBanning) {
            user.isBanned = true;
            user.bannedBy = new Types.ObjectId(actionBy);
            if (options?.banEmail) {
                await addEmailJob(emailQueue, EMAIL_JOB_NAMES.ACCOUNT_BAN, {
                    email: user.email,
                });
            }
        } else {
            user.isBanned = false;
            user.bannedBy = null;
        }

        await user.save();

        await Promise.all([
            userCacheService.invalidateUser(userId),
            userCacheService.invalidateUserEverything(userId),
        ]);

        return {
            message: user.isBanned
                ? "User banned successfully"
                : "User unbanned successfully",
            data: user,
        };
    },
};

export default userService;