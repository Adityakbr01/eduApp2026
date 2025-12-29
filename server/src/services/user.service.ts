import path from "path";
import { cacheKeyFactory } from "src/cache/cacheKeyFactory.js";
import cacheManager from "src/cache/cacheManager.js";
import { TTL } from "src/cache/cacheTTL.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { attachPermissionsToUser, type RolePermissionCache } from "src/helpers/attachUserPermissionHelper.js";
import { RoleModel } from "src/models/role.model.js";
import UserModel from "src/models/user.model.js";
import { authRepository } from "src/repositories/auth.repository.js";
import AppError from "src/utils/AppError.js";
import logger from "src/utils/logger.js";


const userService = {
    //get All Users with pagination
    getAllUsers: async (reqQuery) => {
        let { page = 1, limit = 10 } = reqQuery;

        page = Math.max(1, Number(page));
        limit = Math.max(1, Number(limit));

        const skip = (page - 1) * limit;

        // Build Query (optional filters)
        const query = {};


        // Redis Cache Key
        const cacheKey = cacheKeyFactory.user.paginated(page, limit, reqQuery.search, reqQuery.roleId);

        try {
            const cached = await cacheManager.get(cacheKey);
            if (cached) {
                const rolePermissionsCache: RolePermissionCache = new Map();
                let cachedUsers = Array.isArray(cached.users) ? cached.users : [];

                const needsEnrichment = cachedUsers.some((user) => !user?.rolePermissions || !user?.effectivePermissions);

                if (needsEnrichment) {
                    cachedUsers = await Promise.all(
                        cachedUsers.map((user: any) => attachPermissionsToUser(user, rolePermissionsCache))
                    );
                    cached.users = cachedUsers;
                    await cacheManager.set(cacheKey, cached, TTL.USER_LIST);
                }

                return {
                    message: "Users fetched successfully (cached)",
                    users: cachedUsers,
                    pagination: cached.pagination,
                    success: true,
                };
            }
        } catch (err) {
            logger.warn("cache.get failed in getAllUsers:", err);
        }

        // Fetch Users with Pagination
        const [users, totalUsers] = await Promise.all([
            UserModel.find(query)
                .populate("roleId")
                .skip(skip)
                .limit(limit)
                .lean(),
            UserModel.countDocuments(query),
        ]);



        if (!users.length) {
            throw new AppError("No users found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND, [{
                path: "users", message: "No users available in the database"
            }]);
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

        // Cache result
        try {
            await cacheManager.set(cacheKey, { users: usersWithPermissions, pagination }, TTL.USER_LIST);
        } catch (err) {
            logger.warn("cache.set failed:", err);
        }

        return {
            message: "Users fetched successfully",
            users: usersWithPermissions,
            pagination,
        };
    },
    getMyRoleANDPermission: async (userId: string) => {
        const user = await authRepository.findUserMinimalById(userId);

        if (!user) {
            throw new AppError("User not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND, [{
                path: "user", message: "No user found with the given ID"
            }]);
        }

        const enrichedUser = await attachPermissionsToUser(user);
        return {
            message: "User fetched successfully",
            data: enrichedUser,
        };
    },
    // getUserById: async (userId: string) => {
    //     const cacheKey = cacheKeyFactory.user.byId(userId);

    //     // Try cache first
    //     try {
    //         const cached = await cacheManager.get(cacheKey);
    //         if (cached) {
    //             let cachedUser = cached;
    //             if (!cachedUser?.rolePermissions || !cachedUser?.effectivePermissions) {
    //                 cachedUser = await attachPermissionsToUser(cachedUser);
    //                 await cacheManager.set(cacheKey, cachedUser, TTL.USER_PROFILE);
    //             }

    //             return {
    //                 message: "User fetched successfully (cached)",
    //                 user: cachedUser,
    //                 success: true,
    //             };
    //         }
    //     } catch (err) {
    //         logger.warn("cache.get failed in getUserById:", err);
    //     }

    //     const user = await User.findById(userId).exec();
    //     if (!user) {
    //         throw new ApiError({
    //             statusCode: 404, message: "User not found", errors: [
    //                 { path: "user", message: "No user found with the given ID" }
    //             ]
    //         })
    //     }

    //     const enrichedUser = await attachPermissionsToUser(user);

    //     // Cache the result
    //     try {
    //         await cacheManager.set(cacheKey, enrichedUser, TTL.USER_PROFILE);
    //     } catch (err) {
    //         logger.warn("cache.set failed in getUserById:", err);
    //     }

    //     return {
    //         message: "User fetched successfully",
    //         user: enrichedUser,
    //         success: true,
    //     };
    // },
    // updateUserById: async (userId: string, updateData: Partial<typeof User>) => {
    //     const existingUser = await User.findById(userId).exec();
    //     if (!existingUser) {
    //         throw new ApiError({
    //             statusCode: 404, message: "User not found", errors: [
    //                 { path: "user", message: "No user found with the given ID" }
    //             ]
    //         });
    //     }

    //     const previousRoleId = existingUser.roleId?.toString();
    //     const previousPermissions = Array.isArray(existingUser.permissions) ? [...existingUser.permissions] : [];
    //     const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).exec();

    //     if (!updatedUser) {
    //         throw new ApiError({
    //             statusCode: 500,
    //             message: "Failed to apply user updates",
    //             errors: [{ path: "user", message: "Unable to update user" }]
    //         });
    //     }

    //     const updatePayload = updateData as Record<string, unknown>;
    //     const incomingRoleId = updatePayload?.roleId ? String(updatePayload.roleId) : undefined;
    //     const roleChanged = Boolean(incomingRoleId && incomingRoleId !== previousRoleId);
    //     const permissionsChanged = permissionsArrayChanged(updatePayload?.permissions as unknown[], previousPermissions);

    //     await cacheInvalidation.invalidateUser(userId);

    //     if (roleChanged) {
    //         if (previousRoleId) {
    //             await cacheInvalidation.invalidateUsersWithRole(previousRoleId);
    //         }
    //         if (updatedUser.roleId) {
    //             await cacheInvalidation.invalidateUsersWithRole(updatedUser.roleId.toString());
    //         }
    //         await cacheInvalidation.invalidateAllUserPermissions();
    //         await cacheInvalidation.invalidateUserSession(userId);
    //     } else if (permissionsChanged) {
    //         await cacheInvalidation.invalidateAllUserPermissions();
    //         await cacheInvalidation.invalidateUserSession(userId);
    //     }

    //     return {
    //         message: "User updated successfully",
    //         data: updatedUser,
    //     };
    // },
    // deleteUserById: async (userId: string, deletedBy: string) => {
    //     //Todo : add soft delete
    //     const user = await User.findById(userId).exec();
    //     if (!user) {
    //         throw new ApiError({
    //             statusCode: 404, message: "User not found", errors: [
    //                 { path: "user", message: "No user found with the given ID" }
    //             ]
    //         });
    //     }

    //     if (deletedBy.toString() === userId.toString()) {
    //         throw new ApiError({
    //             statusCode: 403, message: "You cannot delete your own account", errors: [
    //                 { path: "user", message: "Users cannot delete their own account" }
    //             ]
    //         });
    //     }

    //     await User.findByIdAndDelete(userId).exec();

    //     // Invalidate all user-related caches
    //     await cacheInvalidation.invalidateUser(userId);

    //     return {
    //         message: "User deleted successfully",
    //         data: user,
    //     };
    // },
    // Roles and Permissions
    getAllRoleANDPermission: async () => {
        const cacheKey = cacheKeyFactory.role.all();

        // Try cache first
        try {
            const cached = await cacheManager.get(cacheKey);
            if (cached) {
                return {
                    message: "Roles and permissions fetched successfully (cached)",
                    data: cached,
                };
            }
        } catch (err) {
            logger.warn("cache.get failed in getRolesAndPermissions:", err);
        }

        const rolesWithPermissions = await RoleModel.aggregate([
            // 1️⃣ Join RolePermission to get permissions for each role
            {
                $lookup: {
                    from: "rolepermissions",      // RolePermission collection
                    localField: "_id",
                    foreignField: "roleId",
                    as: "rolePermissions"
                }
            },
            // 2️⃣ Join Permission collection to get permission details
            {
                $lookup: {
                    from: "permissions",
                    localField: "rolePermissions.permissionId",
                    foreignField: "_id",
                    as: "permissions"
                }
            },
            // 3️⃣ Project only needed fields
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    permissions: { _id: 1, code: 1, description: 1 } // optional: only these fields
                }
            }
        ]);

        if (!rolesWithPermissions || rolesWithPermissions.length === 0) {
            throw new AppError("No roles found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND, [{
                statusCode: 404,
                message: "No roles found",
                errors: [
                    { path: "roles", message: "No roles found in the database" }
                ]
            }]);
        }

        // Cache the result
        try {
            await cacheManager.set(cacheKey, rolesWithPermissions, TTL.ROLE_PERMISSIONS);
        } catch (err) {
            logger.warn("cache.set failed in getRolesAndPermissions:", err);
        }

        return {
            message: "Roles and permissions fetched successfully",
            data: rolesWithPermissions,
        };
    },
    // assignPermissions: async (assignData: { userId: string; permission: string[] }, assignBy: string) => {
    //     const { userId, permission } = assignData;


    //     if (assignBy.toString() === userId.toString()) {
    //         throw new ApiError({
    //             statusCode: 403,
    //             message: "User cannot assign permissions to themselves",
    //             errors: [
    //                 { path: "user", message: "You cannot assign permissions to your own account" }
    //             ]
    //         });
    //     }

    //     const user = await User.findById(userId).exec();
    //     if (!user) {
    //         throw new ApiError({
    //             statusCode: 404,
    //             message: "User not found",
    //             errors: [{ path: "user", message: "No user found with the given ID" }]
    //         });
    //     }

    //     // ✅ FIX — get only permissions array
    //     const { permissions: rolePermissions } = await getUserPermissions(user.roleId);

    //     const existingPermissions = [
    //         ...new Set([
    //             ...(rolePermissions || []),
    //             ...(user.permissions || [])
    //         ])
    //     ];

    //     const newPermissions = permission.filter(p => !existingPermissions.includes(p));

    //     if (newPermissions.length === 0) {
    //         throw new ApiError({
    //             statusCode: 400,
    //             message: "User already has the given permissions",
    //             errors: [{ path: "permissions", message: "User already has the given permissions" }]
    //         });
    //     }

    //     user.permissions = [...user.permissions, ...newPermissions];
    //     await user.save();

    //     // Invalidate user caches when permissions change
    //     await cacheInvalidation.invalidateUser(userId);
    //     await cacheInvalidation.invalidateAllUserPermissions();
    //     await cacheInvalidation.invalidateUserSession(userId);

    //     return {
    //         message: "Permissions assigned successfully",
    //         data: user,
    //     };
    // },
    // deletePermissions: async (deleteData: { userId: string; permission: string[] }, deleteBy: string) => {
    //     const { userId, permission } = deleteData;
    //     if (deleteBy.toString() === userId.toString()) {
    //         throw new ApiError({
    //             statusCode: 403,
    //             message: "User cannot delete permissions from themselves",
    //             errors: [{ path: "user", message: "You cannot delete permissions from your own account" }]
    //         });
    //     }
    //     const user = await User.findById(userId).exec();
    //     if (!user) {
    //         throw new ApiError({
    //             statusCode: 404,
    //             message: "User not found",
    //             errors: [{ path: "user", message: "No user found with the given ID" }]
    //         });
    //     }
    //     const updatedPermissions = (user.permissions || []).filter(p => !permission.includes(p));
    //     if (updatedPermissions.length === user.permissions.length) {
    //         throw new ApiError({
    //             statusCode: 400,
    //             message: "User does not have the given permissions",
    //             errors: [{ path: "permissions", message: "User does not have the given permissions" }]
    //         });
    //     }

    //     user.permissions = updatedPermissions;
    //     await user.save();

    //     // Invalidate user caches when permissions change
    //     await cacheInvalidation.invalidateUser(userId);
    //     await cacheInvalidation.invalidateAllUserPermissions();
    //     await cacheInvalidation.invalidateUserSession(userId);

    //     return {
    //         message: "Permissions deleted successfully",
    //         data: user,
    //     };
    // },
    // approveUser: async (userId: string, approvedBy: string) => {

    //     const user = await User.findById(userId).exec();
    //     if (!user) {
    //         throw new ApiError({
    //             statusCode: 404, message: "User not found", errors: [
    //                 { path: "user", message: "No user found with the given ID" }
    //             ]
    //         });
    //     }

    //     if (user.approvalStatus === approvalStatusEnum.APPROVED) {
    //         throw new ApiError({
    //             statusCode: 400, message: "User already approved", errors: [
    //                 { path: "user", message: "User is already approved" }
    //             ]
    //         });
    //     }

    //     if (userId.toString() === approvedBy.toString()) {
    //         throw new ApiError({
    //             statusCode: 403, message: "User approval denied", errors: [
    //                 { path: "user", message: "You cannot approve your own account" }
    //             ]
    //         });
    //     }

    //     await addEmailJob(emailQueue, EMAIL_JOB_Names.ACCOUNT_APPROVAL, {
    //         to: user.email,
    //     });
    //     user.approvalStatus = approvalStatusEnum.APPROVED;
    //     user.approvedBy = new Types.ObjectId(approvedBy);
    //     await user.save();

    //     // Invalidate user caches when user is approved
    //     await cacheInvalidation.invalidateUser(userId);

    //     return {
    //         message: "User approved successfully",
    //         data: user,
    //     };
    // },
    // banUser: async (userId: string, bannedBy: string) => {

    //     const user = await User.findById(userId).exec();
    //     if (!user) {
    //         throw new ApiError({
    //             statusCode: 404, message: "User not found", errors: [
    //                 { path: "user", message: "No user found with the given ID" }
    //             ]
    //         });
    //     }

    //     if (userId.toString() === bannedBy.toString()) {
    //         throw new ApiError({
    //             statusCode: 403, message: "You cannot ban your own account", errors: [
    //                 { path: "user", message: "You cannot ban your own account" }
    //             ]
    //         });
    //     }

    //     if (!user.isBanned) {
    //         await addEmailJob(emailQueue, EMAIL_JOB_Names.ACCOUNT_BAN, {
    //             to: user.email,
    //         });
    //     }

    //     if (user.isBanned) {
    //         user.isBanned = false; // Unban the user
    //     } else {
    //         user.isBanned = true; // Ban the user
    //         user.bannedBy = new Types.ObjectId(bannedBy);
    //     }
    //     await user.save();

    //     // Invalidate user caches when user is banned or unbanned
    //     await cacheInvalidation.invalidateUser(userId);

    //     return {
    //         message: user.isBanned ? "User banned successfully" : "User unbanned successfully",
    //         data: user,
    //     };
    // }
};

export default userService;