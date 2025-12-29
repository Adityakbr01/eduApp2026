import type { IUser } from "src/types/user.model.type.js";
import { getUserExtraPermissions } from "./getUserExtraPermissions.js";
import { getUserRolePermissions } from "./getUserPermissions.js";
import resolveRoleId from "./resolveRoleId.js";
import type { UserWithRole } from "src/types/auth.type.js";

// Type for caching role permissions Helper
type RolePermissionCache = Map<string, string[]>;

const attachPermissionsToUser = async (
    user: UserWithRole | IUser,
    rolePermissionsCache: RolePermissionCache = new Map()
) => {
    const roleId = resolveRoleId(user?.roleId?._id ?? user?.roleId?._id);

    let rolePermissions = rolePermissionsCache.get(roleId);
    let customPermissions: any[] = [];
    customPermissions = await getUserExtraPermissions(user.permissions);
    if (!rolePermissions) {
        const { permissions = [] } = await getUserRolePermissions(roleId);
        rolePermissions = [...(permissions || [])];
        rolePermissionsCache.set(roleId, rolePermissions);
    }

    return {
        ...user,
        customPermissions: customPermissions,
        rolePermissions: [...rolePermissions],
    };
};

export { attachPermissionsToUser, type RolePermissionCache };
