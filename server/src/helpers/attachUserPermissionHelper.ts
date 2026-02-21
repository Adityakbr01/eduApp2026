import type { UserWithRole } from "src/types/auth.type.js";
import type { IUser } from "src/types/user.model.type.js";
import { getUserExtraPermissions } from "./getUserExtraPermissions.js";
import { getUserRolePermissions } from "./getUserPermissions.js";

// Type for caching role permissions Helper
type RolePermissionCache = Map<string, string[]>;

const attachPermissionsToUser = async (
    user: UserWithRole | IUser,
    rolePermissionsCache: RolePermissionCache = new Map()
) => {

    let rolePermissions = rolePermissionsCache.get(String(user.roleId));
    let customPermissions: any[] = [];
    customPermissions = await getUserExtraPermissions(user.permissions);
    if (!rolePermissions) {
        const { permissions = [] } = await getUserRolePermissions(user?.roleId?._id);
        rolePermissions = [...(permissions || [])];
        rolePermissionsCache.set(String(user.roleId), rolePermissions);
    }

    return {
        ...user,
        customPermissions: customPermissions,
        rolePermissions: [...rolePermissions],
    };
};

export { attachPermissionsToUser, type RolePermissionCache };

