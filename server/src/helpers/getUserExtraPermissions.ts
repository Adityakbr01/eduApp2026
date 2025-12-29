import { Types } from "mongoose";
import cacheManager from "src/cache/cacheManager.js";
import { cacheKeyFactory } from "src/cache/cacheKeyFactory.js";
import { TTL } from "src/cache/cacheTTL.js";
import { RolePermissionModel } from "src/models/rolePermission.model.js";
import logger from "src/utils/logger.js";

export interface PermissionSummary {
    _id: string;
    code: string;
    description?: string;
}

export const getUserExtraPermissions = async (
    permissionsIds: string[] | Types.ObjectId[]
): Promise<PermissionSummary[]> => {

    const objectIds = permissionsIds.map(id => new Types.ObjectId(id));
    const cacheKey = cacheKeyFactory.user.permissions(objectIds.map(id => id.toString()).sort().join("_"));

    // Try to get from cache first
    try {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
    } catch (err) {
        logger.warn("cache.get failed in getUserExtraPermissions:", err);
    }

    const result = await RolePermissionModel.aggregate([
        // 1️⃣ Filter by permissionIds
        { $match: { permissionId: { $in: objectIds } } },
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
        // 3️⃣ Group to deduplicate permissions, push full object
        {
            $group: {
                _id: null,
                permissions: {
                    $addToSet: {
                        _id: "$permissionDetails._id",
                        code: "$permissionDetails.code",
                        description: "$permissionDetails.description"
                    }
                }
            }
        },
    ]);

    const permissions: PermissionSummary[] = result[0]?.permissions || [];

    // Cache the result
    try {
        await cacheManager.set(cacheKey, permissions, TTL.USER_PERMISSIONS);
    } catch (err) {
        logger.warn("cache.set failed in getUserExtraPermissions:", err);
    }

    return permissions;
};
