import { ActiveRole } from "../UserAccessTab";
import React from "react";

type Props = {
    activeRoles: ActiveRole[];
};

const ActiveRolesSection = ({ activeRoles }: Props) => (
    <div>
        <p className="text-sm font-semibold">Active Roles</p>

        {activeRoles.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
                No active roles assigned
            </p>
        ) : (
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {activeRoles.map((role) => (
                    <div
                        key={role.name}
                        className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm shadow-sm"
                    >
                        <p className="font-medium">{role.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {role.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                            Assigned {role.assigned}
                        </p>
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default React.memo(ActiveRolesSection);
