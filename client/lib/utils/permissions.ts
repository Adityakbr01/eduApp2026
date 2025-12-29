import type { User } from "@/services/auth";
type PermissionLike = string | { code: string };

export type PermissionCarrier =
    | User
    | PermissionLike[]   // 👈 yahin fix
    | Set<string>
    | null
    | undefined;

export type PermissionRequirement = string | string[];


const ensureArray = (value?: PermissionRequirement): string[] => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
};

const fromUser = (user?: User | null): string[] => {
    if (!user) return [];
    return [
        ...(user.effectivePermissions ?? []),
        ...(user.permissions ?? []),
        ...(user.rolePermissions ?? []),
        ...(user.customPermissions ?? []),
    ];
};

export const collectPermissions = (carrier?: PermissionCarrier): Set<string> => {
    if (!carrier) return new Set();

    if (carrier instanceof Set) {
        return new Set(carrier);
    }

    if (Array.isArray(carrier)) {
        return new Set(
            carrier
                .map((p: PermissionLike) =>
                    typeof p === "string" ? p : p.code
                )
                .filter((code): code is string => Boolean(code))
        );
    }

    return new Set(fromUser(carrier));
};



export const hasAllPermissions = (carrier: PermissionCarrier, requirement: PermissionRequirement): boolean => {
    const available = collectPermissions(carrier);
    const requiredList = ensureArray(requirement);
    if (!requiredList.length) return true;
    return requiredList.every((code) => available.has(code));
};

export const hasAnyPermission = (carrier: PermissionCarrier, requirement: PermissionRequirement): boolean => {
    const available = collectPermissions(carrier);
    const requiredList = ensureArray(requirement);
    if (!requiredList.length) return true;
    return requiredList.some((code) => available.has(code));
};

export const missingPermissions = (carrier: PermissionCarrier, requirement: PermissionRequirement): string[] => {
    const available = collectPermissions(carrier);
    const requiredList = ensureArray(requirement);
    if (!requiredList.length) return [];
    return requiredList.filter((code) => !available.has(code));
};

export const summarizePermissions = (carrier: PermissionCarrier) => {
    const available = collectPermissions(carrier);
    return {
        total: available.size,
        list: Array.from(available).sort(),
    };
};


export const CheckPermission = (props: {
    carrier: PermissionCarrier;
    requirement: PermissionRequirement;
}): boolean => {
    const { carrier, requirement } = props;
    return hasAllPermissions(carrier, requirement);
}


export const checkRole = (user: User | null | undefined, role: string): boolean => {
    if (!user || !user.roleName) return false;
    return user.roleName === role;
}