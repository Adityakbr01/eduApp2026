import { cacheKeyFactory } from "src/cache/cacheKeyFactory.js";
import cacheManager from "src/cache/cacheManager.js";
import { TTL } from "src/cache/cacheTTL.js";
import type { PermissionDTO } from "src/types/auth.type.js";
import logger from "src/utils/logger.js";

// =====================
// TYPES & INTERFACES
// =====================

export interface SessionData {
    sessionId: string;
    userId: string;
    roleId?: string;
    roleName?: string;
    createdAt: number;
    expiresAt: number;
}

type PermissionType = "role" | "custom" | "effective";

// =====================
// USER CACHE SERVICE
// =====================

class UserCacheService {
    // =====================
    // SESSION MANAGEMENT
    // =====================

    private getSessionKey(userId: string): string {
        return cacheKeyFactory.session.byUserId(userId);
    }

    private getSessionTTL(): number {
        return TTL.ONE_WEEK;
    }

    /**
     * Create or overwrite user session
     */
    async createSession(
        userId: string,
        sessionId: string,
        roleId: string,
        roleName: string
    ): Promise<void> {
        const now = Date.now();
        const ttl = this.getSessionTTL();

        const session: SessionData = {
            sessionId: String(sessionId),
            userId: String(userId),
            roleId: String(roleId),
            roleName,
            createdAt: now,
            expiresAt: now + ttl * 1000,
        };

        await cacheManager.set(this.getSessionKey(userId), session, ttl);
    }

    /**
     * Get active session
     */
    async getSession(userId: string): Promise<SessionData | null> {
        return cacheManager.get<SessionData>(this.getSessionKey(userId));
    }

    /**
     * Validate session (for JWT guard)
     */
    async validateSession(userId: string, sessionId: string): Promise<boolean> {
        const session = await this.getSession(userId);

        if (!session) return false;

        // Single-device enforcement
        if (session.sessionId !== sessionId) return false;

        // Check expiry
        if (session.expiresAt < Date.now()) {
            await this.deleteSession(userId);
            return false;
        }

        return true;
    }

    /**
     * Delete session (logout)
     */
    async deleteSession(userId: string): Promise<void> {
        await cacheManager.del(this.getSessionKey(userId));
    }

    /**
     * Check if user has active session
     */
    async hasActiveSession(userId: string): Promise<boolean> {
        const session = await this.getSession(userId);
        return !!session && session.expiresAt > Date.now();
    }

    // =====================
    // USER PROFILE CACHE
    // =====================

    private getProfileKey(userId: string): string {
        return cacheKeyFactory.user.byId(userId);
    }

    /**
     * Cache user profile
     */
    async createUserProfile(userId: string, profileData: any): Promise<void> {
        const ttl = TTL.ONE_WEEK;
        await cacheManager.set(
            this.getProfileKey(userId),
            { ...profileData, cachedAt: Date.now() },
            ttl
        );
    }

    /**
     * Get cached user profile
     */
    async getUserProfile(userId: string): Promise<any | null> {
        return cacheManager.get(this.getProfileKey(userId));
    }

    /**
     * Delete cached user profile
     */
    async deleteUserProfile(userId: string): Promise<void> {
        await cacheManager.del(this.getProfileKey(userId));
    }

    // =====================
    // PERMISSIONS CACHE
    // =====================

    private getPermissionKey(userId: string, type: PermissionType): string {
        // return cacheKeyFactory.permissions.byUserId(userId, type);
        return `permissions:user:${userId}:${type}`;
    }

    /**
     * Set permissions with TTL
     */
    private async setPermissions(
        userId: string,
        type: PermissionType,
        permissions: PermissionDTO[]
    ): Promise<void> {
        const ttl = TTL.ONE_WEEK;
        await cacheManager.set(this.getPermissionKey(userId, type), permissions, ttl);
    }

    /**
     * Get permissions from cache
     */
    private async getPermissions(
        userId: string,
        type: PermissionType
    ): Promise<PermissionDTO[]> {
        return (await cacheManager.get<PermissionDTO[]>(this.getPermissionKey(userId, type))) || [];
    }

    // =====================
    // ROLE PERMISSIONS
    // =====================

    /**
     * Set role-based permissions
     */
    async setRolePermissions(userId: string, permissions: PermissionDTO[]): Promise<void> {
        await this.setPermissions(userId, "role", permissions);
        await this.rebuildEffectivePermissions(userId);
    }

    /**
     * Get role-based permissions
     */
    async getRolePermissions(userId: string): Promise<PermissionDTO[]> {
        return this.getPermissions(userId, "role");
    }

    // =====================
    // CUSTOM PERMISSIONS
    // =====================

    /**
     * Set custom permissions
     */
    async setCustomPermissions(userId: string, permissions: PermissionDTO[]): Promise<void> {
        await this.setPermissions(userId, "custom", permissions);
        await this.rebuildEffectivePermissions(userId);
    }

    /**
     * Get custom permissions
     */
    async getCustomPermissions(userId: string): Promise<PermissionDTO[]> {
        return this.getPermissions(userId, "custom");
    }

    /**
     * Add a single custom permission
     */
    async addCustomPermission(userId: string, permission: PermissionDTO): Promise<void> {
        const current = await this.getCustomPermissions(userId);
        const map = new Map(current.map((p) => [p.code, p]));
        map.set(permission.code, permission);
        await this.setCustomPermissions(userId, Array.from(map.values()));
    }

    /**
     * Remove a custom permission by code
     */
    async removeCustomPermission(userId: string, code: string): Promise<void> {
        const current = await this.getCustomPermissions(userId);
        await this.setCustomPermissions(
            userId,
            current.filter((p) => p.code !== code)
        );
    }

    // =====================
    // EFFECTIVE PERMISSIONS
    // =====================

    /**
     * Get effective (merged) permissions
     */
    async getEffectivePermissions(userId: string): Promise<PermissionDTO[]> {
        return this.getPermissions(userId, "effective");
    }

    /**
     * Rebuild effective permissions from role + custom
     */
    private async rebuildEffectivePermissions(userId: string): Promise<void> {
        const [rolePerms, customPerms] = await Promise.all([
            this.getRolePermissions(userId),
            this.getCustomPermissions(userId),
        ]);

        // Merge: custom overrides role
        const map = new Map<string, PermissionDTO>();
        [...rolePerms, ...customPerms].forEach((perm) => {
            map.set(perm.code, perm);
        });

        await this.setPermissions(userId, "effective", Array.from(map.values()));
    }

    // =====================
    // BATCH OPERATIONS
    // =====================

    /**
     * Clear all permissions for a user
     */
    async clearAllPermissions(userId: string): Promise<void> {
        await Promise.allSettled([
            cacheManager.del(this.getPermissionKey(userId, "role")),
            cacheManager.del(this.getPermissionKey(userId, "custom")),
            cacheManager.del(this.getPermissionKey(userId, "effective")),
        ]);
    }

    /**
     * Clear all user data (session, profile, permissions)
     */
    async clearAllUserData(userId: string): Promise<void> {
        await Promise.allSettled([
            this.deleteSession(userId),
            this.deleteUserProfile(userId),
            this.clearAllPermissions(userId),
        ]);
        logger.info(`✅ All user data cleared | userId=${userId}`);
    }

    async addCourseToUserCache(
    userId: string,
    course: {
        courseId: string;
        enrollmentId: string;
        purchasedAt: number;
    }
): Promise<void> {
    const profile = await this.getUserProfile(userId);

    // If profile not cached yet → do nothing (lazy rebuild later)
    if (!profile) return;

    const exists = profile.enrolledCourses?.some(
        (c: any) => c.courseId === course.courseId
    );

    if (exists) return;

    profile.enrolledCourses = [
        ...(profile.enrolledCourses ?? []),
        course,
    ];

    await cacheManager.set(
        this.getProfileKey(userId),
        {
            ...profile,
            cachedAt: Date.now(),
        },
        TTL.ONE_WEEK
    );
}


}

export default new UserCacheService();
