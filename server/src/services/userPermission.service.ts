import cacheManager from "src/cache/cacheManager.js";
import cacheInvalidation from "src/cache/cacheInvalidation.js";
import type { PermissionDTO } from "src/types/auth.type.js";

type PermissionType = "role" | "custom" | "effective";

class UserPermissionService {
    private getKey(userId: string, type: PermissionType): string {
        return `permissions:user:${userId}:${type}`;
    }

    // -----------------------------
    // Generic helpers
    // -----------------------------
    private async set(
        userId: string,
        type: PermissionType,
        permissions: PermissionDTO[]
    ): Promise<void> {
        await cacheManager.set(this.getKey(userId, type), permissions);
    }

    private async get(
        userId: string,
        type: PermissionType
    ): Promise<PermissionDTO[]> {
        return (await cacheManager.get(this.getKey(userId, type))) || [];
    }

    // -----------------------------
    // Role permissions
    // -----------------------------
    async setRolePermissions(userId: string, permissions: PermissionDTO[]) {
        await this.set(userId, "role", permissions);
        await this.rebuildEffectivePermissions(userId);
    }

    async getRolePermissions(userId: string) {
        return this.get(userId, "role");
    }

    // -----------------------------
    // Custom permissions
    // -----------------------------
    async setCustomPermissions(userId: string, permissions: PermissionDTO[]) {
        await this.set(userId, "custom", permissions);
        await this.rebuildEffectivePermissions(userId);
    }

    async getCustomPermissions(userId: string) {
        return this.get(userId, "custom");
    }

    async addCustomPermission(userId: string, permission: PermissionDTO) {
        const current = await this.getCustomPermissions(userId);

        const map = new Map<string, PermissionDTO>();
        current.forEach((p) => map.set(p.code, p));
        map.set(permission.code, permission);

        await this.setCustomPermissions(userId, Array.from(map.values()));
    }

    async removeCustomPermission(userId: string, code: string) {
        const current = await this.getCustomPermissions(userId);
        await this.setCustomPermissions(
            userId,
            current.filter((p) => p.code !== code)
        );
    }

    // -----------------------------
    // Effective permissions
    // -----------------------------
    async getEffectivePermissions(userId: string) {
        return this.get(userId, "effective");
    }

    private async rebuildEffectivePermissions(userId: string) {
        const rolePerms = await this.getRolePermissions(userId);
        const customPerms = await this.getCustomPermissions(userId);

        const map = new Map<string, PermissionDTO>();

        [...rolePerms, ...customPerms].forEach((perm) => {
            map.set(perm.code, perm); // custom overrides role
        });

        await this.set(userId, "effective", Array.from(map.values()));
    }

    // -----------------------------
    // Clear all
    // -----------------------------
    async clearAllPermissions(userId: string) {
        await Promise.all([
            cacheManager.del(this.getKey(userId, "role")),
            cacheManager.del(this.getKey(userId, "custom")),
            cacheManager.del(this.getKey(userId, "effective")),
        ])
    }
}

export default new UserPermissionService();
