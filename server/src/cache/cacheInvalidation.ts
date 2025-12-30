import cacheManager from "./cacheManager.js";
import { cacheKeyFactory } from "./cacheKeyFactory.js";
import logger from "src/utils/logger.js";

const PAGINATED_USERS_PATTERN = "users:page=*";

export const cacheInvalidation = {
    async invalidateUser(userId: string): Promise<void> {
        try {
            await Promise.all([
                cacheManager.del(cacheKeyFactory.user.byId(userId)),
                cacheManager.del(cacheKeyFactory.user.permissions(userId)),
                cacheManager.del(cacheKeyFactory.user.all()),
                cacheManager.delPattern(PAGINATED_USERS_PATTERN)
            ]);
        } catch (err) {
            logger.warn("Failed to invalidate user cache:", err);
        }
    },
    async invalidateUserList(): Promise<void> {
        try {
            await Promise.all([
                cacheManager.del(cacheKeyFactory.user.all()),
                cacheManager.delPattern(PAGINATED_USERS_PATTERN)
            ]);
        } catch (err) {
            logger.warn("Failed to invalidate user list cache:", err);
        }
    },
    async invalidateRolePermissions(roleId: string): Promise<void> {
        try {
            await Promise.all([
                cacheManager.del(cacheKeyFactory.role.permissions(roleId)),
                cacheManager.del(cacheKeyFactory.role.all())
            ]);
        } catch (err) {
            logger.warn("Failed to invalidate role permissions cache:", err);
        }
    },
    async invalidateAllRoles(): Promise<void> {
        try {
            // Invalidate all role permission patterns
            await cacheManager.delPattern("role:permissions:*");
            await cacheManager.del(cacheKeyFactory.role.all());
        } catch (err) {
            logger.warn("Failed to invalidate all roles cache:", err);
        }
    },
    async invalidateAllUserPermissions(): Promise<void> {
        try {
            await cacheManager.delPattern("user:permissions:*");
        } catch (err) {
            logger.warn("Failed to invalidate all user permissions cache:", err);
        }
    },
    async invalidateUsersWithRole(roleId: string): Promise<void> {
        try {
            // Invalidate role permissions cache
            await cacheManager.del(cacheKeyFactory.role.permissions(roleId));

            // Invalidate all user permissions (since we can't easily find all users with this role)
            // In production, you might want to query users with this roleId and invalidate specifically
            await cacheManager.delPattern("user:permissions:*");
        } catch (err) {
            logger.warn("Failed to invalidate users with role cache:", err);
        }
    },
};

export default cacheInvalidation;
