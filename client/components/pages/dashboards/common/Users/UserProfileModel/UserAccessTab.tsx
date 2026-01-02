import { type PermissionFormValues, type PermissionOption } from "./permissionTypes";
import { type UseFormReturn } from "react-hook-form";
import ActiveRolesSection from "./UserAccessTab/ActiveRolesSection";
import PermissionCollectionsSection from "./UserAccessTab/PermissionCollectionsSection";
import ManualOverridesSection from "./UserAccessTab/ManualOverridesSection";

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

// Custom permission with both _id (for API) and code (for display)
export type CustomPermissionItem = {
    _id: string;
    code: string;
    description?: string;
};

export type ManualOverridesProps = {
    targetUserId?: string;
    isLoadingPermissions: boolean;
    queryError: Error | null;
    permissionOptions: PermissionOption[];
    customPermissions: CustomPermissionItem[];
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
    console.log("Rendering UserAccessTab");
    console.log("Active Roles:", activeRoles);
    console.log("Permission Collections:", permissionCollections);
    console.log("Manual Overrides Props:", manualOverrides);
    console.log("Debugger Payload:", debuggerPayload);
    return (
        <div ref={panelRef} className="space-y-4 rounded-2xl border border-border/60 bg-muted/10 p-4">
            <ActiveRolesSection activeRoles={activeRoles} />
            <PermissionCollectionsSection permissionCollections={permissionCollections} />
            <ManualOverridesSection {...manualOverrides} />

            <PermissionDebuggerSection payload={debuggerPayload} />
        </div>
    );
};




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
