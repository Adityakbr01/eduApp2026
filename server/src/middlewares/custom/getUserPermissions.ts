import { Types } from "mongoose";
import { RolePermissionModel } from "src/models/rolePermission.model.js";
import cacheManager from "src/cache/cacheManager.js";
import { cacheKeyFactory } from "src/cache/cacheKeyFactory.js";
import { TTL } from "src/cache/cacheTTL.js";
import logger from "src/utils/logger.js";

export const getUserPermissions = async (roleId: string | Types.ObjectId) => {
    const roleObjectId = new Types.ObjectId(roleId);
    const cacheKey = cacheKeyFactory.role.permissions(String(roleId));

    // Try to get from cache first
    try {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
    } catch (err) {
        logger.warn("cache.get failed in getUserPermissions:", err);
    }

    const result = await RolePermissionModel.aggregate([
        // 1️⃣ Filter by roleId (indexed for performance)
        { $match: { roleId: roleObjectId } },

        // 2️⃣ Join with permissions
        {
            $lookup: {
                from: "permissions",          // Permission collection
                localField: "permissionId",
                foreignField: "_id",
                as: "permissionDetails"
            }
        },
        { $unwind: "$permissionDetails" },

        // 3️⃣ Group by roleId to deduplicate permissions
        {
            $group: {
                _id: "$roleId",
                permissions: { $addToSet: "$permissionDetails.code" } // $addToSet removes duplicates
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

    // Cache the result
    try {
        await cacheManager.set(cacheKey, permissions, TTL.ROLE_PERMISSIONS);
    } catch (err) {
        logger.warn("cache.set failed in getUserPermissions:", err);
    }

    return permissions;
};
