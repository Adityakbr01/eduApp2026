import { InfoItem } from "./UserInfoTab";
import { CustomPermissionItem } from "./UserAccessTab";

export const buildInfoItems = (
    email: string | null,
    roleNames: string[] | null,
    phone: string | null,
    approvalStatus: string | null,
    isEmailVerified: boolean | null
): InfoItem[] => {
    return [
        {
            label: "Email",
            value: email || "—",
        },
        {
            label: "Roles",
            value: roleNames?.length ? roleNames.join(", ") : "—",
        },
        {
            label: "Phone",
            value: phone || "—",
        },
        {
            label: "Approval Status",
            value: approvalStatus || "—",
        },
        {
            label: "Email Verified",
            value: isEmailVerified ? "Yes" : "No",
        },
    ];
};

// Permission can be either a string or an object with code property
type PermissionInput = string | { code?: string; _id?: string } | null | undefined;

/**
 * Extracts the permission code from a permission item.
 * Handles both string values and objects with a `code` property.
 */
export const getPermissionCode = (perm: PermissionInput): string | null => {
    if (!perm) return null;
    if (typeof perm === "string") return perm;
    if (typeof perm === "object" && "code" in perm && perm.code) return perm.code;
    return null;
};

/**
 * Extracts unique permission codes from an array.
 * Handles both string arrays and arrays of permission objects.
 */
export const uniqueList = (values?: PermissionInput[]): string[] => {
    if (!values) return [];
    const codes = values
        .map(getPermissionCode)
        .filter((code): code is string => Boolean(code));
    return Array.from(new Set(codes));
};

/**
 * Extracts custom permission items with both _id and code.
 * Returns an array of { _id, code } objects for permissions that have both.
 */
export const extractCustomPermissionItems = (
    values?: PermissionInput[]
): CustomPermissionItem[] => {
    if (!values) return [];
    const items: CustomPermissionItem[] = [];
    const seen = new Set<string>();

    for (const perm of values) {
        if (!perm || typeof perm === "string") continue;
        if (typeof perm === "object" && perm._id && perm.code) {
            if (!seen.has(perm._id)) {
                seen.add(perm._id);
                items.push({ _id: perm._id, code: perm.code });
            }
        }
    }
    return items;
};