import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type PermissionFormValues, type PermissionOption } from "./permissionTypes";
import { type UseFormReturn } from "react-hook-form";

export type ActiveRole = {
    name: string;
    description?: string;
    assigned?: string;
};

export type PermissionCollection = {
    title: string;
    description: string;
    permissions: string[];
    emptyLabel: string;
};

export type ManualOverridesProps = {
    targetUserId?: string;
    isLoadingPermissions: boolean;
    queryError: Error | null;
    permissionOptions: PermissionOption[];
    customPermissions: string[];
    permissionForm: UseFormReturn<PermissionFormValues>;
    removePermissionForm: UseFormReturn<PermissionFormValues>;
    onAssignPermission: (values: PermissionFormValues) => void;
    onRemovePermission: (values: PermissionFormValues) => void;
    isPermissionActionDisabled: boolean;
    isRemoveActionDisabled: boolean;
    assignPending: boolean;
    deletePending: boolean;
};

type UserAccessTabProps = {
    panelRef: (node: HTMLDivElement | null) => void;
    activeRoles: ActiveRole[];
    permissionCollections: PermissionCollection[];
    manualOverrides: ManualOverridesProps;
    debuggerPayload: unknown;
};

const UserAccessTab = ({ panelRef, activeRoles, permissionCollections, manualOverrides, debuggerPayload }: UserAccessTabProps) => {
    return (
        <div ref={panelRef} className="space-y-4 rounded-2xl border border-border/60 bg-muted/10 p-4">
            <ActiveRolesSection activeRoles={activeRoles} />
            <PermissionCollectionsSection permissionCollections={permissionCollections} />
            <ManualOverridesSection {...manualOverrides} />
            <PermissionDebuggerSection payload={debuggerPayload} />
        </div>
    );
};

const ActiveRolesSection = ({ activeRoles }: { activeRoles: ActiveRole[] }) => (
    <div>
        <p className="text-sm font-semibold">Active Roles</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {activeRoles.map((role) => (
                <div key={role.name} className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm shadow-sm">
                    <p className="font-medium">{role.name}</p>
                    <p className="text-muted-foreground text-xs">{role.description}</p>
                    <p className="text-[11px] text-muted-foreground">Assigned {role.assigned}</p>
                </div>
            ))}
        </div>
    </div>
);

const PermissionCollectionsSection = ({ permissionCollections }: { permissionCollections: PermissionCollection[] }) => (
    <div>
        <p className="text-sm font-semibold">Scoped Permissions</p>
        <div className="mt-2 grid gap-3">
            {permissionCollections.map((collection) => (
                <div key={collection.title} className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm shadow-sm">
                    <div className="flex flex-col gap-1">
                        <p className="font-medium">{collection.title}</p>
                        <p className="text-[11px] text-muted-foreground">{collection.description}</p>
                    </div>
                    {collection.permissions.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {collection.permissions.map((permission) => (
                                <Badge
                                    key={`${collection.title}-${permission}`}
                                    variant="outline"
                                    className="border-primary/30 bg-background text-primary"
                                >
                                    {permission}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-2 text-xs text-muted-foreground">{collection.emptyLabel}</p>
                    )}
                </div>
            ))}
        </div>
    </div>
);

const ManualOverridesSection = ({
    targetUserId,
    isLoadingPermissions,
    queryError,
    permissionOptions,
    customPermissions,
    permissionForm,
    removePermissionForm,
    onAssignPermission,
    onRemovePermission,
    isPermissionActionDisabled,
    isRemoveActionDisabled,
    assignPending,
    deletePending,
}: ManualOverridesProps) => (
    <div>
        <p className="text-sm font-semibold">Manual Overrides</p>
        <div className="mt-2 space-y-3 rounded-xl border border-dashed border-primary/30 bg-background/70 p-3 text-sm shadow-sm">
            <div>
                <p className="font-medium">Add a permission</p>
                <p className="text-[11px] text-muted-foreground">
                    Sends payload {" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
                        {`{ "userId": "${targetUserId ?? "user-id"}", "permission": ["permission:code"] }`}
                    </code>{" "}
                    to the API.
                </p>
            </div>
            <Form {...permissionForm}>
                <form onSubmit={permissionForm.handleSubmit(onAssignPermission)} className="flex flex-col gap-3 sm:flex-row">
                    <FormField
                        control={permissionForm.control}
                        name="permission"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Permission</FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={isLoadingPermissions || assignPending || !permissionOptions.length}
                                    >
                                        <SelectTrigger className="rounded-xl border border-input/60 bg-background/80 text-left shadow-sm">
                                            <SelectValue
                                                placeholder={
                                                    isLoadingPermissions
                                                        ? "Loading permissions..."
                                                        : permissionOptions.length
                                                            ? "Select a permission"
                                                            : "No new permissions"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent align="start" className="w-[320px]">
                                            {permissionOptions.map((option) => (
                                                <SelectItem key={option.code} value={option.code}>
                                                    <div className="flex flex-col text-left">
                                                        <span className="text-sm font-medium">{option.code}</span>
                                                        {option.description && (
                                                            <span className="text-xs text-muted-foreground">{option.description}</span>
                                                        )}
                                                        {option.roles.length > 0 && (
                                                            <span className="text-[10px] text-muted-foreground">
                                                                Roles: {option.roles.join(", ")}
                                                            </span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isPermissionActionDisabled} className="sm:self-end">
                        {assignPending ? "Adding..." : "Add Permission"}
                    </Button>
                </form>
            </Form>
            {!isLoadingPermissions && !permissionOptions.length && (
                <p className="text-xs text-muted-foreground">User already has every available permission.</p>
            )}
            {queryError && (
                <p className="text-xs text-destructive">Unable to load role permissions. Please refresh.</p>
            )}
            <div className="border-border/70 pt-3 text-sm">
                <p className="font-medium">Remove a custom permission</p>
                <p className="text-[11px] text-muted-foreground">
                    Calls <code className="rounded bg-muted px-1 py-0.5 text-[11px]">DELETE /users/roles-permissions</code> using the same payload shape.
                </p>
                <Form {...removePermissionForm}>
                    <form onSubmit={removePermissionForm.handleSubmit(onRemovePermission)} className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <FormField
                            control={removePermissionForm.control}
                            name="permission"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Custom Permission</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={isRemoveActionDisabled}
                                        >
                                            <SelectTrigger className="rounded-xl border border-input/60 bg-background/80 text-left shadow-sm">
                                                <SelectValue
                                                    placeholder={
                                                        customPermissions.length
                                                            ? "Select a permission"
                                                            : "No removable permissions"
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent align="start" className="w-[320px]">
                                                {customPermissions.map((permission) => (
                                                    <SelectItem key={`remove-${permission}`} value={permission}>
                                                        {permission}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" variant="destructive" disabled={isRemoveActionDisabled} className="sm:self-end">
                            {deletePending ? "Removing..." : "Remove Permission"}
                        </Button>
                    </form>
                </Form>
                {!customPermissions.length && (
                    <p className="mt-1 text-xs text-muted-foreground">No custom permissions to delete.</p>
                )}
            </div>
        </div>
    </div>
);

const PermissionDebuggerSection = ({ payload }: { payload: unknown }) => (
    <details className="rounded-xl border border-dashed border-border/70 bg-background/60 p-3 text-sm" data-animate="section">
        <summary className="cursor-pointer font-semibold">Permission debugger</summary>
        <p className="mt-2 text-xs text-muted-foreground">Snapshot of the raw payload returned by the backend for this user.</p>
        <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-muted/60 p-3 text-xs text-left">
            {JSON.stringify(payload, null, 2)}
        </pre>
    </details>
);

export default UserAccessTab;
