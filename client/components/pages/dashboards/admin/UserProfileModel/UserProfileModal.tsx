"use client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import userMutations from "@/services/users/mutations";
import usersQueries from "@/services/users/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import UserInfoTab, { type InfoItem } from "./UserInfoTab";
import UserAccessTab from "./UserAccessTab";
import { permissionFormSchema, type PermissionFormValues, type PermissionOption } from "./permissionTypes";
import { buildInfoItems, buildPermissionCollections } from "./userProfileUtils";
import { uniqueList } from "./Utils";
import { UserRow } from "../../common/types";

type UserProfileModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserRow;
};



function UserProfileModal({ open, onOpenChange, user }: UserProfileModalProps) {
    const [activeTab, setActiveTab] = useState("info");
    const dialogContentRef = useRef<HTMLDivElement | null>(null);
    const tabPanelsRef = useRef<Record<string, HTMLDivElement | null>>({});
    const { data: allRolesAndPermissions, error, isLoading } = usersQueries.useGetAllRoleANDPermission();


    useEffect(() => {
        if (!open) return;
        const panel = tabPanelsRef.current[activeTab];
        if (!panel) return;
        const children = Array.from(panel.children);
        if (!children.length) return;
        gsap.fromTo(
            children,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.06 }
        );
    }, [activeTab, open]);

    const registerTabPanel = (key: string) => (node: HTMLDivElement | null) => {
        tabPanelsRef.current[key] = node;
    };

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

    const derivedCustomPermissions = useMemo(
        () => uniqueList(user.customPermissions ?? user.sourceUser?.customPermissions ?? []),
        [user.customPermissions, user.sourceUser?.customPermissions]
    );

    const derivedEffectivePermissions = useMemo(() => {
        if (user.effectivePermissions && user.effectivePermissions.length) return uniqueList(user.effectivePermissions);
        if (user.permissions && user.permissions.length) return uniqueList(user.permissions);
        if (user.sourceUser?.effectivePermissions && user.sourceUser.effectivePermissions.length) {
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

    const [customPermissionSnapshot, setCustomPermissionSnapshot] = useState<string[]>(derivedCustomPermissions);
    const [effectivePermissionSnapshot, setEffectivePermissionSnapshot] = useState<string[]>(derivedEffectivePermissions);

    useEffect(() => {
        setCustomPermissionSnapshot(derivedCustomPermissions);
    }, [derivedCustomPermissions]);

    useEffect(() => {
        setEffectivePermissionSnapshot(derivedEffectivePermissions);
    }, [derivedEffectivePermissions]);

    const permissionForm = useForm<PermissionFormValues>({
        resolver: zodResolver(permissionFormSchema),
        defaultValues: {
            permission: "",
        },
    });
    const resetPermissionForm = permissionForm.reset;

    const assignPermissionsMutation = userMutations.useAssignPermissions({
        onSuccess: (_, variables) => {
            resetPermissionForm();
            if (variables?.permission?.length) {
                setCustomPermissionSnapshot((prev) => {
                    const next = new Set(prev);
                    variables.permission.forEach((perm) => next.add(perm));
                    return Array.from(next);
                });
                setEffectivePermissionSnapshot((prev) => {
                    const next = new Set(prev);
                    variables.permission.forEach((perm) => next.add(perm));
                    return Array.from(next);
                });
            }
        },
    });

    const resetAssignPermission = assignPermissionsMutation.reset;

    const removePermissionForm = useForm<PermissionFormValues>({
        resolver: zodResolver(permissionFormSchema),
        defaultValues: {
            permission: "",
        },
    });
    const resetRemovePermissionForm = removePermissionForm.reset;

    const deletePermissionsMutation = userMutations.useDeletePermissions({
        onSuccess: (_, variables) => {
            resetRemovePermissionForm();
            if (variables?.permission?.length) {
                const removalSet = new Set(variables.permission);
                setCustomPermissionSnapshot((prev) => prev.filter((perm) => !removalSet.has(perm)));
                setEffectivePermissionSnapshot((prev) =>
                    prev.filter((perm) => {
                        if (!removalSet.has(perm)) return true;
                        return derivedRolePermissions.includes(perm);
                    })
                );
            }
        },
    });

    const resetDeletePermission = deletePermissionsMutation.reset;

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setActiveTab("info");
            resetPermissionForm();
            resetAssignPermission();
            resetRemovePermissionForm();
            resetDeletePermission();
        }
        onOpenChange(nextOpen);
    };

    const onAssignPermission = (values: PermissionFormValues) => {
        if (!targetUserId) return;
        assignPermissionsMutation.mutate({
            userId: targetUserId,
            permission: [values.permission],
        });
    };

    const onRemovePermission = (values: PermissionFormValues) => {
        if (!targetUserId) return;
        deletePermissionsMutation.mutate({
            userId: targetUserId,
            permission: [values.permission],
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

    const debuggerPayload = user.sourceUser ?? user;
    const targetUserId = user.sourceUser?._id ?? user.id;

    const permissionOptions = useMemo<PermissionOption[]>(() => {
        if (!allRolesAndPermissions?.length) return [];
        const assigned = new Set(effectivePermissionSnapshot);
        const map = new Map<string, PermissionOption>();

        allRolesAndPermissions.forEach((role) => {
            role.permissions.forEach((permission) => {
                if (!permission?.code || assigned.has(permission.code)) return;
                const existing = map.get(permission.code);
                if (existing) {
                    if (role.name && !existing.roles.includes(role.name)) {
                        existing.roles.push(role.name);
                    }
                } else {
                    map.set(permission.code, {
                        code: permission.code,
                        description: permission.description,
                        roles: role.name ? [role.name] : [],
                    });
                }
            });
        });

        return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
    }, [allRolesAndPermissions, effectivePermissionSnapshot]);

    const isPermissionActionDisabled =
        !targetUserId || assignPermissionsMutation.isPending || !permissionOptions.length;

    const isRemoveActionDisabled =
        !targetUserId || deletePermissionsMutation.isPending || !customPermissionSnapshot.length;

    useEffect(() => {
        resetPermissionForm();
        resetAssignPermission();
        resetRemovePermissionForm();
        resetDeletePermission();
    }, [resetPermissionForm, resetAssignPermission, resetRemovePermissionForm, resetDeletePermission, user.id]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                ref={dialogContentRef}
                className="flex max-h-[85vh] flex-col overflow-y-scroll border border-border/70 bg-background/95 shadow-2xl backdrop-blur sm:max-w-2xl"
            >
                <DialogHeader data-animate="section">
                    <DialogTitle>User profile</DialogTitle>
                    <DialogDescription>
                        A quick snapshot of account details and current access levels.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 flex h-full flex-col">
                    <TabsList
                        data-animate="section"
                        className="w-full justify-start gap-2 rounded-none border-none bg-transparent p-0"
                    >
                        <TabsTrigger
                            value="info"
                            className="group inline-flex items-center gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition data-[state=active]:border-primary data-[state=active]:text-foreground"
                        >
                            <UserRound className="h-4 w-4 text-muted-foreground group-data-[state=active]:text-primary" />
                            User Info
                        </TabsTrigger>
                        <TabsTrigger
                            value="access"
                            className="group inline-flex items-center gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition data-[state=active]:border-primary data-[state=active]:text-foreground"
                        >
                            <ShieldCheck className="h-4 w-4 text-muted-foreground group-data-[state=active]:text-primary" />
                            Permissions & Roles
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="mt-4 flex-1 overflow-auto">
                        <UserInfoTab
                            panelRef={registerTabPanel("info")}
                            displayName={user.name ?? user.email ?? ""}
                            infoItems={infoItems}
                        />
                    </TabsContent>

                    <TabsContent value="access" className="mt-4 flex-1 overflow-auto">
                        <UserAccessTab
                            panelRef={registerTabPanel("access")}
                            activeRoles={activeRoles}
                            permissionCollections={permissionCollections}
                            debuggerPayload={debuggerPayload}
                            manualOverrides={{
                                targetUserId,
                                isLoadingPermissions: isLoading,
                                queryError: error ?? null,
                                permissionOptions,
                                customPermissions: customPermissionSnapshot,
                                permissionForm,
                                removePermissionForm,
                                onAssignPermission,
                                onRemovePermission,
                                isPermissionActionDisabled,
                                isRemoveActionDisabled,
                                assignPending: assignPermissionsMutation.isPending,
                                deletePending: deletePermissionsMutation.isPending,
                            }}
                        />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

export default UserProfileModal;