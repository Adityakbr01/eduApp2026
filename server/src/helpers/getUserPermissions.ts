import { Types } from "mongoose";
import { cacheKeyFactory } from "src/cache/cacheKeyFactory.js";
import cacheManager from "src/cache/cacheManager.js";
import { TTL } from "src/cache/cacheTTL.js";
import { RolePermissionModel } from "src/models/rolePermission.model.js";
import logger from "src/utils/logger.js";

export const getUserRolePermissions = async (roleId: string | Types.ObjectId) => {
    const roleIdStr = String(roleId);
    const roleObjectId = new Types.ObjectId(roleId);
    const cacheKey = cacheKeyFactory.role.permissions(roleIdStr);

    // Try to get from cache first
    try {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
    } catch (err) {
        logger.warn("cache.get failed in getUserRolePermissions:", err);
    }

    const result = await RolePermissionModel.aggregate([
        // 1️⃣ Filter by roleId
        { $match: { roleId: roleObjectId } },

        // 2️⃣ Join with permissions
        {
            $lookup: {
                from: "permissions",
                localField: "permissionId",
                foreignField: "_id",
                as: "permissionDetails"
            }
        },
        { $unwind: "$permissionDetails" },

        // 3️⃣ Group by roleId and collect full permission objects
        {
            $group: {
                _id: "$roleId",
                permissions: {
                    $addToSet: {
                        _id: "$permissionDetails._id",
                        code: "$permissionDetails.code",
                        description: "$permissionDetails.description"
                    }
                }
            }
        },

        // 4️⃣ Join with role to get role name
        {
            $lookup: {
                from: "roles",
                localField: "_id",
                foreignField: "_id",
                as: "roleDetails"
            }
        },
        { $unwind: "$roleDetails" },

        // 5️⃣ Project only required fields
        {
            $project: {
                _id: 0,
                role: "$roleDetails.name",
                permissions: 1
            }
        }
    ]);


    // Aggregation returns single doc per role
    const permissions = result[0] || { role: null, permissions: [] };

    // Cache the result (1 hour TTL - roles rarely change)
    try {
        await cacheManager.set(cacheKey, permissions, TTL.ROLE_PERMISSIONS);
    } catch (err) {
        logger.warn("cache.set failed in getUserRolePermissions:", err);
    }

    return permissions;
};
