export type StatusMeta = {
    label: string;
    className: string;
};

import type { User } from "@/services/auth";

export type UserRow = {
    id: string;
    name: string;
    email: string;
    roleLabel: string;
    roleDescription?: string;
    status: StatusMeta;
    lastActive: string;
    rolePermissions?: string[];
    customPermissions?: string[];
    permissions?: string[];
    effectivePermissions?: string[];
    sourceUser?: User;
};
