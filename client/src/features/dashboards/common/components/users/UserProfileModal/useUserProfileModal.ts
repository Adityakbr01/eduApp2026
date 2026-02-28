import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import userMutations from "@/services/users/mutations";
import usersQueries from "@/services/users/queries";
import { CheckPermission } from "@/lib/utils/permissions";
import app_permissions from "@/constants/permissions";
import { useEffectivePermissions } from "@/store/myPermission";
import { UserRow } from "../../../types";

import {
    permissionFormSchema,
    type PermissionFormValues,
    type PermissionOption,
} from "./permissionTypes";
import { buildInfoItems, buildPermissionCollections } from "./userProfileUtils";
import { uniqueList, extractCustomPermissionItems } from "./utils";
import { type CustomPermissionItem } from "./UserAccessTab";
import { type InfoItem } from "./UserInfoTab/UserInfoTab";

export function useUserProfileModal(user: UserRow, open: boolean) {
    const {
        data: allRolesAndPermissions,
        error,
        isLoading,
    } = usersQueries.useGetAllRoleANDPermission();

    const myEffectivePermissions = useEffectivePermissions();

    const canManageUser = CheckPermission({
        carrier: myEffectivePermissions,
        requirement: app_permissions.MANAGE_USER,
    });

    const canManageUserPermission = CheckPermission({
        carrier: myEffectivePermissions,
        requirement: app_permissions.MANAGE_PERMISSIONS,
    });

    const formatDate = (value?: string) => {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "—";
        return new Intl.DateTimeFormat("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    };

    const derivedRolePermissions = useMemo(
        () => uniqueList(user.rolePermissions ?? user.sourceUser?.rolePermissions ?? []),
        [user.rolePermissions, user.sourceUser?.rolePermissions]
    );

    const derivedCustomPermissionItems = useMemo(
        () => extractCustomPermissionItems(user.customPermissions ?? user.sourceUser?.customPermissions ?? []),
        [user.customPermissions, user.sourceUser?.customPermissions]
    );

    const derivedCustomPermissions = useMemo(
        () => uniqueList(user.customPermissions ?? user.sourceUser?.customPermissions ?? []),
        [user.customPermissions, user.sourceUser?.customPermissions]
    );

    const derivedEffectivePermissions = useMemo(() => {
        if (user.effectivePermissions && user.effectivePermissions.length)
            return uniqueList(user.effectivePermissions);
        if (user.permissions && user.permissions.length)
            return uniqueList(user.permissions);
        if (
            user.sourceUser?.effectivePermissions &&
            user.sourceUser.effectivePermissions.length
        ) {
            return uniqueList(user.sourceUser.effectivePermissions);
        }
        return uniqueList([...derivedRolePermissions, ...derivedCustomPermissions]);
    }, [
        user.effectivePermissions,
        user.permissions,
        user.sourceUser?.effectivePermissions,
        derivedRolePermissions,
        derivedCustomPermissions,
    ]);

    const [customPermissionSnapshot, setCustomPermissionSnapshot] = useState<CustomPermissionItem[]>(derivedCustomPermissionItems);
    const [effectivePermissionSnapshot, setEffectivePermissionSnapshot] = useState<string[]>(derivedEffectivePermissions);

    useEffect(() => {
        setCustomPermissionSnapshot(derivedCustomPermissionItems);
    }, [derivedCustomPermissionItems]);

    useEffect(() => {
        setEffectivePermissionSnapshot(derivedEffectivePermissions);
    }, [derivedEffectivePermissions]);

    const permissionForm = useForm<PermissionFormValues>({
        resolver: zodResolver(permissionFormSchema),
        defaultValues: { permission: "" },
    });
    const resetPermissionForm = permissionForm.reset;

    const permissionOptions = useMemo<PermissionOption[]>(() => {
        if (!allRolesAndPermissions?.length) return [];
        const assigned = new Set(effectivePermissionSnapshot);
        const map = new Map<string, PermissionOption>();

        allRolesAndPermissions.forEach((role) => {
            role.permissions.forEach((permission) => {
                if (!permission?.code || !permission?._id || assigned.has(permission.code)) return;
                const existing = map.get(permission.code);
                if (existing) {
                    if (role.name && !existing.roles.includes(role.name)) {
                        existing.roles.push(role.name);
                    }
                } else {
                    map.set(permission.code, {
                        _id: permission._id,
                        code: permission.code,
                        description: permission.description,
                        roles: role.name ? [role.name] : [],
                    });
                }
            });
        });

        return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
    }, [allRolesAndPermissions, effectivePermissionSnapshot]);

    const assignPermissionsMutation = userMutations.useAssignPermissions({
        onSuccess: (_, variables) => {
            resetPermissionForm();
            if (variables?.permission) {
                const addedOption = permissionOptions.find((opt) => opt._id === variables.permission);
                if (addedOption) {
                    setCustomPermissionSnapshot((prev) => [...prev, { _id: addedOption._id, code: addedOption.code }]);
                    setEffectivePermissionSnapshot((prev) => {
                        const next = new Set(prev);
                        next.add(addedOption.code);
                        return Array.from(next);
                    });
                }
            }
        },
    });
    const resetAssignPermission = assignPermissionsMutation.reset;

    const removePermissionForm = useForm<PermissionFormValues>({
        resolver: zodResolver(permissionFormSchema),
        defaultValues: { permission: "" },
    });
    const resetRemovePermissionForm = removePermissionForm.reset;

    const deletePermissionsMutation = userMutations.useDeletePermissions({
        onSuccess: (_, variables) => {
            resetRemovePermissionForm();
            if (variables?.permission) {
                const removedId = variables.permission;
                const removedItem = customPermissionSnapshot.find((p) => p._id === removedId);
                setCustomPermissionSnapshot((prev) => prev.filter((perm) => perm._id !== removedId));
                if (removedItem) {
                    setEffectivePermissionSnapshot((prev) =>
                        prev.filter((code) => {
                            if (code !== removedItem.code) return true;
                            return derivedRolePermissions.includes(code);
                        })
                    );
                }
            }
        },
    });
    const resetDeletePermission = deletePermissionsMutation.reset;

    const targetUserId = user.sourceUser?._id ?? user.sourceUser?.id ?? user._id ?? user.id;
    const debuggerPayload = user.sourceUser ?? user;

    useEffect(() => {
        if (!open) {
            resetPermissionForm();
            resetAssignPermission();
            resetRemovePermissionForm();
            resetDeletePermission();
        }
    }, [
        open,
        resetPermissionForm,
        resetAssignPermission,
        resetRemovePermissionForm,
        resetDeletePermission,
    ]);

    useEffect(() => {
        resetPermissionForm();
        resetAssignPermission();
        resetRemovePermissionForm();
        resetDeletePermission();
    }, [
        resetPermissionForm,
        resetAssignPermission,
        resetRemovePermissionForm,
        resetDeletePermission,
        user.id,
        user._id,
    ]);

    const onAssignPermission = (values: PermissionFormValues) => {
        if (!targetUserId) return;
        assignPermissionsMutation.mutate({
            userId: targetUserId,
            permission: values.permission,
        });
    };

    const onRemovePermission = (values: PermissionFormValues) => {
        if (!targetUserId) return;
        deletePermissionsMutation.mutate({
            userId: targetUserId,
            permission: values.permission,
        });
    };

    const accountCreatedAt = user.sourceUser?.createdAt ?? user.sourceUser?.updatedAt;
    const timezoneGuess = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const roleDescription = user.roleDescription ?? user.sourceUser?.roleId?.description ?? "No description provided";

    const activeRoles = useMemo(
        () => [
            {
                name: user.roleLabel || user.sourceUser?.roleId?.name || "Unknown role",
                description: roleDescription,
                assigned: formatDate(user.sourceUser?.createdAt),
            },
        ],
        [user.roleLabel, user.sourceUser?.roleId?.name, roleDescription, user.sourceUser?.createdAt]
    );

    const normalizedStatus = user.status?.label?.toLowerCase() ?? "unknown";
    const formattedCreated = formatDate(accountCreatedAt);

    const infoItems: InfoItem[] = useMemo(
        () =>
            buildInfoItems({
                user,
                formattedCreated,
                timezoneGuess,
                normalizedStatus,
            }),
        [user, formattedCreated, timezoneGuess, normalizedStatus]
    );

    const permissionCollections = useMemo(
        () =>
            buildPermissionCollections({
                rolePermissions: derivedRolePermissions,
                customPermissions: customPermissionSnapshot,
                effectivePermissions: effectivePermissionSnapshot,
            }),
        [derivedRolePermissions, customPermissionSnapshot, effectivePermissionSnapshot]
    );

    const isPermissionActionDisabled = !targetUserId || assignPermissionsMutation.isPending || !permissionOptions.length;
    const isRemoveActionDisabled = !targetUserId || deletePermissionsMutation.isPending || !customPermissionSnapshot.length;

    return {
        canManageUser,
        canManageUserPermission,
        activeRoles,
        infoItems,
        permissionCollections,
        debuggerPayload,
        targetUserId,
        isLoadingPermissions: isLoading,
        queryError: error ?? null,
        permissionOptions,
        customPermissionSnapshot,
        permissionForm,
        removePermissionForm,
        onAssignPermission,
        onRemovePermission,
        isPermissionActionDisabled,
        isRemoveActionDisabled,
        assignPending: assignPermissionsMutation.isPending,
        deletePending: deletePermissionsMutation.isPending,
    };
}
