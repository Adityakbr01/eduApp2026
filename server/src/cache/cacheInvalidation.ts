import logger from "src/utils/logger.js";
import userCache from "src/cache/userCache.js";
import cacheManager from "src/cache/cacheManager.js";
import { cacheKeyFactory } from "src/cache/cacheKeyFactory.js";

// =====================
// CACHE INVALIDATION SERVICE
// =====================

class CacheInvalidation {
    // =====================
    // USER INVALIDATION
    // =====================

    /**
     * Invalidate a single user's cache entries
     */
    async invalidateUser(userId: string): Promise<void> {
        if (!userId) return;

        try {
            await Promise.allSettled([
                cacheManager.del(cacheKeyFactory.user.byId(userId)),
                cacheManager.del(cacheKeyFactory.user.permissions(userId)),
                cacheManager.del(cacheKeyFactory.user.activity(userId)),
                cacheManager.delPattern(cacheKeyFactory.users.PAGINATED_USERS_PATTERN),
            ]);
        } catch (err) {
            logger.warn(`⚠️ Failed to invalidate user cache | userId=${userId}`, err);
        }
    }

    /**
     * Invalidate paginated user lists
     */
    async invalidateUserList(): Promise<void> {
        try {
            await cacheManager.delPattern(cacheKeyFactory.users.PAGINATED_USERS_PATTERN);
        } catch (err) {
            logger.warn("⚠️ Failed to invalidate user list cache", err);
        }
    }

    /**
     * Invalidate all user permissions cache
     */
    async invalidateAllUserPermissions(): Promise<void> {
        try {
            await cacheManager.delPattern(cacheKeyFactory.users.USER_PERMISSIONS_PATTERN);
        } catch (err) {
            logger.warn("⚠️ Failed to invalidate all user permissions cache", err);
        }
    }

    /**
     * Full user invalidation - session, profile, and permissions
     */
    async invalidateUserEverything(userId: string): Promise<void> {
        if (!userId) return;

        try {
            await Promise.allSettled([
                userCache.deleteSession(userId),
                userCache.deleteUserProfile(userId),
                userCache.clearAllPermissions(userId),
                this.invalidateUser(userId),
            ]);
        } catch (err) {
            logger.warn(`⚠️ Failed to invalidate user cache | userId=${userId}`, err);
        }
    }

    // =====================
    // ROLE INVALIDATION
    // =====================

    /**
     * Invalidate role permissions cache
     */
    async invalidateRolePermissions(roleId: string): Promise<void> {
        if (!roleId) return;

        try {
            await Promise.allSettled([
                cacheManager.del(cacheKeyFactory.role.permissions(roleId)),
                cacheManager.del(cacheKeyFactory.role.all()),
                this.invalidateAllUserPermissions(),
                this.invalidateUserList(),
            ]);
        } catch (err) {
            logger.warn(`⚠️ Failed to invalidate role permissions cache | roleId=${roleId}`, err);
        }
    }

    /**
     * Invalidate all roles cache
     */
    async invalidateAllRoles(): Promise<void> {
        try {
            await Promise.allSettled([
                cacheManager.delPattern(cacheKeyFactory.users.ROLE_PERMISSIONS_PATTERN),
                cacheManager.del(cacheKeyFactory.role.all()),
            ]);
        } catch (err) {
            logger.warn("⚠️ Failed to invalidate all roles cache", err);
        }
    }

    /**
     * Invalidate users affected by a role change
     */
    async invalidateUsersWithRole(roleId: string): Promise<void> {
        if (!roleId) return;

        try {
            await Promise.allSettled([
                cacheManager.del(cacheKeyFactory.role.permissions(roleId)),
                this.invalidateAllUserPermissions(),
                this.invalidateUserList(),
            ]);
        } catch (err) {
            logger.warn(`⚠️ Failed to invalidate users with role cache | roleId=${roleId}`, err);
        }
    }

    // =====================
    // NUCLEAR OPTIONS
    // =====================

    /**
     * Invalidate all user-related caches (use sparingly)
     */
    async invalidateAllUsers(): Promise<void> {
        try {
            await Promise.allSettled([
                cacheManager.delPattern(cacheKeyFactory.users.ALL_USERS_PATTERN),
                cacheManager.delPattern(cacheKeyFactory.users.USER_PERMISSIONS_PATTERN),
                cacheManager.delPattern(cacheKeyFactory.users.ROLE_PERMISSIONS_PATTERN),
            ]);
            logger.warn("⚠️ Nuclear cache invalidation | all users");
        } catch (err) {
            logger.error("❌ Failed nuclear cache invalidation", err);
        }
    }

    /**
     * Invalidate session for a user (force logout)
     */
    async invalidateUserSession(userId: string): Promise<void> {
        if (!userId) return;

        try {
            await userCache.deleteSession(userId);
        } catch (err) {
            logger.warn(`⚠️ Failed to invalidate user session | userId=${userId}`, err);
        }
    }
}

export const cacheInvalidation = new CacheInvalidation();
export default cacheInvalidation;
