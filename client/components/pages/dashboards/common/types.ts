export type StatusMeta = {
    label: string;
    className: string;
};

import type { User } from "@/services/auth";

// Permission can be either a string (code) or an object with code property
export type PermissionItem = string | { code: string; _id?: string; description?: string };

export type UserRow = {
    id: string;
    name: string;
    email: string;
    roleLabel: string;
    roleDescription?: string;
    status: StatusMeta;
    lastActive: string;
    rolePermissions?: PermissionItem[];
    customPermissions?: PermissionItem[];
    permissions?: PermissionItem[];
    effectivePermissions?: PermissionItem[];
    sourceUser?: User;
};
