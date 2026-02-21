import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";
import { ManualOverridesProps } from "../UserAccessTab";

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
    canManageUserPermission,
}: ManualOverridesProps) => {
    return (
        <div>
            <div>
                <p className="text-sm font-semibold">Manual Overrides</p>
                <div className="mt-2 space-y-3 rounded-xl border border-dashed border-primary/30 bg-background/70 p-3 text-sm shadow-sm">
                    <div>
                        <p className="font-medium">Add a permission</p>
                        <p className="text-[11px] text-muted-foreground">
                            Sends payload {" "}
                            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
                                {`{ "userId": "${targetUserId ?? "user-id"}", "permission": "permission-id" }`}
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
                                                <SelectContent align="start" className="">
                                                    {permissionOptions.map((option) => (
                                                        <SelectItem key={option._id} value={option._id}>
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
                            <Button type="submit" disabled={isPermissionActionDisabled || !canManageUserPermission} className="sm:self-end">
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
                                                    <SelectContent align="start" className="">
                                                        {customPermissions.map((permission) => (
                                                            <SelectItem key={`remove-${permission._id}`} value={permission._id}>
                                                                {permission.code}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" variant="destructive" disabled={isRemoveActionDisabled || !canManageUserPermission} className="sm:self-end">
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
        </div>
    );
};


export default React.memo(ManualOverridesSection);