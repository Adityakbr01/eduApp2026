import { Types } from "mongoose";
import { cacheKeyFactory } from "src/cache/cacheKeyFactory.js";
import cacheManager from "src/cache/cacheManager.js";
import { TTL } from "src/cache/cacheTTL.js";
import { PermissionModel } from "src/models/permission.model.js";
import logger from "src/utils/logger.js";

export interface PermissionSummary {
    _id: string;
    code: string;
    description?: string;
}

export const getUserExtraPermissions = async (
    permissionsIds: string[] | Types.ObjectId[]
): Promise<PermissionSummary[]> => {
    // Guard - prevents runtime crash
    if (!permissionsIds || permissionsIds.length === 0) {
        return [];
    }

    const objectIds = permissionsIds.map(id => new Types.ObjectId(id));

    // Create cache key from sorted permission IDs
    const cacheKey = cacheKeyFactory.permissions.extra(
        objectIds.map(oid => oid.toString())
    );

    // Try to get from cache first
    try {
        const cached = await cacheManager.get<PermissionSummary[]>(cacheKey);
        if (cached) {
            return cached;
        }
    } catch (err) {
        logger.warn("cache.get failed in getUserExtraPermissions:", err);
    }

    // Direct query on Permission model (simpler than aggregation)
    const permissions = await PermissionModel.find({
        _id: { $in: objectIds }
    })
        .select("_id code description")
        .lean();

    const result: PermissionSummary[] = permissions.map(p => ({
        _id: String(p._id),
        code: p.code,
        description: p.description
    }));

    // Cache the result
    try {
        await cacheManager.set(cacheKey, result, TTL.USER_PERMISSIONS);
    } catch (err) {
        logger.warn("cache.set failed in getUserExtraPermissions:", err);
    }

    return result;
};
