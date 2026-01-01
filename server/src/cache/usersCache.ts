import cacheManager from "src/cache/cacheManager.js";
import { cacheKeyFactory } from "src/cache/cacheKeyFactory.js";
import { TTL } from "src/cache/cacheTTL.js";
import logger from "src/utils/logger.js";
import { attachPermissionsToUser, type RolePermissionCache } from "src/helpers/attachUserPermissionHelper.js";
import sessionService from "./userCache.js";

// =====================
// TYPES & INTERFACES
// =====================

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface PaginatedUsersCache {
    users: any[];
    pagination: PaginationInfo;
    cachedAt: number;
}

interface UserQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: string;
}

interface CacheResult<T> {
    data: T | null;
    hit: boolean;
    stale: boolean;
}

interface CacheStats {
    hits: number;
    misses: number;
    errors: number;
}

// =====================
// CACHE SERVICE CLASS
// =====================

class usersCache {
    private stats: CacheStats = { hits: 0, misses: 0, errors: 0 };
    private readonly STALE_THRESHOLD = 0.8; // Consider stale at 80% of TTL

    // =====================
    // HELPER METHODS
    // =====================

    /**
     * Safe cache get with error handling
     */
    private async safeGet<T>(key: string): Promise<T | null> {
        try {
            return await cacheManager.get(key);
        } catch (err) {
            this.stats.errors++;
            logger.warn(`⚠️ Cache GET failed | key=${key}`, err);
            return null;
        }
    }

    /**
     * Safe cache set with error handling
     */
    private async safeSet(key: string, data: any, ttl: number): Promise<boolean> {
        try {
            await cacheManager.set(key, data, ttl);
            return true;
        } catch (err) {
            this.stats.errors++;
            logger.warn(`⚠️ Cache SET failed | key=${key}`, err);
            return false;
        }
    }

    /**
     * Safe cache delete with error handling
     */
    private async safeDel(key: string): Promise<boolean> {
        try {
            await cacheManager.del(key);
            return true;
        } catch (err) {
            this.stats.errors++;
            logger.warn(`⚠️ Cache DEL failed | key=${key}`, err);
            return false;
        }
    }

    /**
     * Safe pattern delete with error handling
     */
    private async safeDelPattern(pattern: string): Promise<boolean> {
        try {
            await cacheManager.delPattern(pattern);
            return true;
        } catch (err) {
            this.stats.errors++;
            logger.warn(`⚠️ Cache DEL pattern failed | pattern=${pattern}`, err);
            return false;
        }
    }

    /**
     * Check if cached data is stale (approaching expiry)
     */
    private isStale(cachedAt: number, ttl: number): boolean {
        const age = Date.now() - cachedAt;
        const maxAge = ttl * 1000;
        return age > maxAge * this.STALE_THRESHOLD;
    }

    /**
     * Normalize query params for consistent cache keys
     */
    private normalizeParams(params: UserQueryParams): Required<UserQueryParams> {
        return {
            page: Math.max(1, Number(params.page) || 1),
            limit: Math.min(100, Math.max(1, Number(params.limit) || 10)),
            search: (params.search || "").trim().toLowerCase(),
            roleId: (params.roleId || "").trim(),
        };
    }

    // =====================
    // PAGINATED USERS CACHE
    // =====================

    /**
     * Get paginated users from cache with stale-while-revalidate pattern
     */
    async getPaginatedUsers(params: UserQueryParams): Promise<CacheResult<PaginatedUsersCache>> {
        const normalized = this.normalizeParams(params);
        const cacheKey = cacheKeyFactory.user.paginated(
            normalized.page,
            normalized.limit,
            normalized.search,
            normalized.roleId
        );

        const cached = await this.safeGet<PaginatedUsersCache>(cacheKey);

        if (!cached) {
            this.stats.misses++;
            return { data: null, hit: false, stale: false };
        }

        this.stats.hits++;
        const stale = this.isStale(cached.cachedAt || 0, TTL.USER_LIST);

        // Enrich with permissions if missing (lazy enrichment)
        if (cached.users?.some((user: any) => !user?.rolePermissions)) {
            const rolePermissionsCache: RolePermissionCache = new Map();
            cached.users = await Promise.all(
                cached.users.map((user: any) => attachPermissionsToUser(user, rolePermissionsCache))
            );
            // Background update without blocking
            this.setPaginatedUsers(params, cached).catch(() => { });
        }
        return { data: cached, hit: true, stale };
    }

    /**
     * Set paginated users in cache with timestamp
     */
    async setPaginatedUsers(params: UserQueryParams, data: Omit<PaginatedUsersCache, "cachedAt">): Promise<boolean> {
        const normalized = this.normalizeParams(params);
        const cacheKey = cacheKeyFactory.user.paginated(
            normalized.page,
            normalized.limit,
            normalized.search,
            normalized.roleId
        );

        const cacheData: PaginatedUsersCache = {
            ...data,
            cachedAt: Date.now(),
        };

        const success = await this.safeSet(cacheKey, cacheData, TTL.USER_LIST);
        if (success) {
        }
        return success;
    }

    // =====================
    // SINGLE USER CACHE
    // =====================

    /**
     * Get single user from cache by ID
     */
    async getUserById(userId: string): Promise<CacheResult<any>> {
        if (!userId) {
            return { data: null, hit: false, stale: false };
        }

        const cacheKey = cacheKeyFactory.user.byId(userId);
        const cached = await this.safeGet<any>(cacheKey);

        if (!cached) {
            this.stats.misses++;
            return { data: null, hit: false, stale: false };
        }

        this.stats.hits++;

        // Lazy enrichment
        if (!cached?.rolePermissions) {
            const enrichedUser = await attachPermissionsToUser(cached);
            this.setUserById(userId, enrichedUser).catch(() => { });
            return { data: enrichedUser, hit: true, stale: false };
        }
        return { data: cached, hit: true, stale: false };
    }

    /**
     * Set single user in cache
     */
    async setUserById(userId: string, userData: any): Promise<boolean> {
        if (!userId || !userData) return false;

        const cacheKey = cacheKeyFactory.user.byId(userId);
        return this.safeSet(cacheKey, userData, TTL.USER_PROFILE);
    }

    /**
     * Get multiple users by IDs (batch operation)
     */
    async getUsersByIds(userIds: string[]): Promise<Map<string, any>> {
        const results = new Map<string, any>();
        const missingIds: string[] = [];

        // Parallel fetch all users
        const fetchPromises = userIds.map(async (userId) => {
            const result = await this.getUserById(userId);
            if (result.hit && result.data) {
                results.set(userId, result.data);
            } else {
                missingIds.push(userId);
            }
        });

        await Promise.all(fetchPromises);

        if (missingIds.length > 0) {
            logger.debug(`Cache MISS (batch) | ${missingIds.length}/${userIds.length} users`);
        }

        return results;
    }

    // =====================
    // ROLE & PERMISSIONS CACHE
    // =====================

    /**
     * Get role permissions from cache
     */
    async getRolePermissions(roleId: string): Promise<any | null> {
        if (!roleId) return null;
        const cacheKey = cacheKeyFactory.role.permissions(roleId);
        return this.safeGet(cacheKey);
    }

    /**
     * Set role permissions in cache
     */
    async setRolePermissions(roleId: string, permissions: any): Promise<boolean> {
        if (!roleId) return false;
        const cacheKey = cacheKeyFactory.role.permissions(roleId);
        return this.safeSet(cacheKey, permissions, TTL.ROLE_PERMISSIONS);
    }

    /**
     * Get all roles from cache
     */
    async getAllRoles(): Promise<any | null> {
        const cacheKey = cacheKeyFactory.role.all();
        return this.safeGet(cacheKey);
    }

    /**
     * Set all roles in cache
     */
    async setAllRoles(roles: any): Promise<boolean> {
        const cacheKey = cacheKeyFactory.role.all();
        return this.safeSet(cacheKey, roles, TTL.ROLE_PERMISSIONS);
    }

    // =====================
    // CACHE INVALIDATION
    // =====================

    /**
     * Invalidate a single user's cache entries
     */
    async invalidateUser(userId: string): Promise<void> {
        if (!userId) return;

        await Promise.allSettled([
            this.safeDel(cacheKeyFactory.user.byId(userId)),
            this.safeDel(cacheKeyFactory.user.permissions(userId)),
            this.safeDel(cacheKeyFactory.user.activity(userId)),
            this.safeDelPattern(cacheKeyFactory.users.PAGINATED_USERS_PATTERN),
        ]);

        logger.info(`✅ Cache invalidated | user | id=${userId}`);
    }

    /**
     * Invalidate paginated user lists only
     */
    async invalidateUserList(): Promise<void> {
        await this.safeDelPattern(cacheKeyFactory.users.PAGINATED_USERS_PATTERN);
        logger.info(`✅ Cache invalidated | paginated users`);
    }

    /**
     * Invalidate all user permissions
     */
    async invalidateAllUserPermissions(): Promise<void> {
        await this.safeDelPattern(cacheKeyFactory.users.USER_PERMISSIONS_PATTERN);
        logger.info(`✅ Cache invalidated | all user permissions`);
    }

    /**
     * Invalidate role and affected user permissions
     */
    async invalidateRolePermissions(roleId: string): Promise<void> {
        if (!roleId) return;

        await Promise.allSettled([
            this.safeDel(cacheKeyFactory.role.permissions(roleId)),
            this.safeDel(cacheKeyFactory.role.all()),
            this.safeDelPattern(cacheKeyFactory.users.USER_PERMISSIONS_PATTERN),
            this.safeDelPattern(cacheKeyFactory.users.PAGINATED_USERS_PATTERN),
        ]);

        logger.info(`✅ Cache invalidated | role | roleId=${roleId}`);
    }

    /**
     * Invalidate all roles cache
     */
    async invalidateAllRoles(): Promise<void> {
        await Promise.allSettled([
            this.safeDelPattern(cacheKeyFactory.users.ROLE_PERMISSIONS_PATTERN),
            this.safeDel(cacheKeyFactory.role.all()),
        ]);
        logger.info(`✅ Cache invalidated | all roles`);
    }

    /**
     * Full user invalidation including session and permissions
     * Use this when user data changes significantly (ban, role change, etc.)
     */
    async invalidateUserEverything(userId: string): Promise<void> {
        if (!userId) return;

        await Promise.allSettled([
            // Cache invalidation
            this.invalidateUser(userId),
            // Session invalidation
            sessionService.deleteSession(userId),
            sessionService.deleteUserProfile(userId),
            // Permission cache invalidation
            sessionService.clearAllPermissions(userId),
        ]);

        logger.info(`✅ Full invalidation | user | id=${userId}`);
    }

    /**
     * Nuclear option: invalidate all user-related caches
     * Use sparingly - expensive operation
     */
    async invalidateAllUsers(): Promise<void> {
        await Promise.allSettled([
            this.safeDelPattern(cacheKeyFactory.users.ALL_USERS_PATTERN),
            this.safeDelPattern(cacheKeyFactory.users.USER_PERMISSIONS_PATTERN),
            this.safeDelPattern(cacheKeyFactory.users.ROLE_PERMISSIONS_PATTERN),
        ]);
        logger.warn(`⚠️ Nuclear cache invalidation | all users`);
    }

    // =====================
    // CACHE WARMING
    // =====================

    /**
     * Warm up cache for a specific user
     */
    async warmUpUserCache(userId: string, userData: any): Promise<boolean> {
        if (!userId || !userData) return false;

        try {
            const rolePermissionsCache: RolePermissionCache = new Map();
            const enrichedUser = await attachPermissionsToUser(userData, rolePermissionsCache);
            await this.setUserById(userId, enrichedUser);
            return true;
        } catch (err) {
            logger.warn(`⚠️ Cache warm failed | user | id=${userId}`, err);
            return false;
        }
    }

    /**
     * Warm up cache for multiple users (batch)
     */
    async warmUpUsersCacheBatch(users: any[]): Promise<number> {
        const rolePermissionsCache: RolePermissionCache = new Map();
        let successCount = 0;

        const warmPromises = users.map(async (user) => {
            try {
                const enrichedUser = await attachPermissionsToUser(user, rolePermissionsCache);
                const success = await this.setUserById(String(user._id), enrichedUser);
                if (success) successCount++;
            } catch {
                // Silent fail for individual users
            }
        });

        await Promise.allSettled(warmPromises);
        logger.info(`Cache warmed (batch) | ${successCount}/${users.length} users`);
        return successCount;
    }

    /**
     * Pre-warm first page of users (useful on startup)
     */
    async warmUpFirstPage(fetcher: () => Promise<{ users: any[]; pagination: PaginationInfo }>): Promise<boolean> {
        try {
            const data = await fetcher();
            await this.setPaginatedUsers({ page: 1, limit: 10 }, data);
            logger.info(`Cache warmed | first page | ${data.users.length} users`);
            return true;
        } catch (err) {
            logger.warn(`⚠️ Cache warm failed | first page`, err);
            return false;
        }
    }

    // =====================
    // UTILITY & STATS
    // =====================

    /**
     * Check if paginated cache exists for params
     */
    async hasPaginatedUsersCache(params: UserQueryParams): Promise<boolean> {
        const normalized = this.normalizeParams(params);
        const cacheKey = cacheKeyFactory.user.paginated(
            normalized.page,
            normalized.limit,
            normalized.search,
            normalized.roleId
        );
        const cached = await this.safeGet(cacheKey);
        return cached !== null;
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats & { hitRate: string } {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : "0.00";
        return { ...this.stats, hitRate: `${hitRate}%` };
    }

    /**
     * Reset cache statistics
     */
    resetStats(): void {
        this.stats = { hits: 0, misses: 0, errors: 0 };
    }

    /**
     * Health check - verify cache connectivity
     */
    async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
        const testKey = "health:check:user-cache";
        const start = Date.now();

        try {
            await cacheManager.set(testKey, { ts: start }, 5);
            const result = await cacheManager.get(testKey);
            await cacheManager.del(testKey);

            const latencyMs = Date.now() - start;
            return { healthy: result !== null, latencyMs };
        } catch {
            return { healthy: false, latencyMs: Date.now() - start };
        }
    }
}

export default new usersCache();