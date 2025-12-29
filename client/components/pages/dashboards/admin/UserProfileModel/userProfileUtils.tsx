import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InfoItem } from "./UserInfoTab";
import type { PermissionCollection } from "./UserAccessTab";
import { UserRow } from "../../common/types";

type InfoItemsParams = {
    user: UserRow;
    formattedCreated: string;
    timezoneGuess?: string;
    normalizedStatus: string;
};

type PermissionCollectionsParams = {
    rolePermissions: string[];
    customPermissions: string[];
    effectivePermissions: string[];
};

export const STATUS_BADGE_CLASS: Record<string, string> = {
    active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    "pending approval": "border-amber-200 bg-amber-50 text-amber-700",
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    banned: "border-rose-200 bg-rose-50 text-rose-700",
};

export const buildInfoItems = ({
    user,
    formattedCreated,
    timezoneGuess,
    normalizedStatus,
}: InfoItemsParams): InfoItem[] => [
        { label: "User ID", value: user.id },
        { label: "Full Name", value: user.name },
        { label: "Email", value: user.email },
        { label: "Role", value: user.roleLabel },
        {
            label: "Status",
            value: (
                <Badge
                    variant="outline"
                    className={cn(
                        "px-2 py-0.5 text-xs font-semibold capitalize",
                        "border border-input/70",
                        STATUS_BADGE_CLASS[normalizedStatus] ?? "border-muted bg-muted text-muted-foreground"
                    )}
                >
                    {user.status?.label ?? "Unknown"}
                </Badge>
            ),
        },
        { label: "Last Active", value: user.lastActive },
        { label: "Created", value: formattedCreated },
        { label: "Timezone", value: timezoneGuess ?? "UTC" },
    ];

export const buildPermissionCollections = ({
    rolePermissions,
    customPermissions,
    effectivePermissions,
}: PermissionCollectionsParams): PermissionCollection[] => [
        {
            title: "Role permissions",
            description: "Inherited from the assigned role",
            permissions: rolePermissions,
            emptyLabel: "Role has no mapped permissions",
        },
        {
            title: "Custom overrides",
            description: "Explicit overrides applied to this user",
            permissions: customPermissions,
            emptyLabel: "No custom overrides",
        },
        {
            title: "Effective permissions",
            description: "Final union sent by the backend",
            permissions: effectivePermissions,
            emptyLabel: "No active permissions",
        },
    ];
