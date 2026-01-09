import React from "react";
import { Badge } from "@/components/ui/badge";
import { PermissionCollection } from "../UserAccessTab";

type Props = {
    permissionCollections: PermissionCollection[];
};

function PermissionCollectionsSection({ permissionCollections }: Props) {
    return (
        <div>
            <p className="text-sm font-semibold">Scoped Permissions</p>

            <div className="mt-2 grid gap-3">
                {permissionCollections.map((collection) => (
                    <div
                        key={collection.title}
                        className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm shadow-sm"
                    >
                        <div className="flex flex-col gap-1">
                            <p className="font-medium">{collection.title}</p>
                            <p className="text-[11px] text-muted-foreground">
                                {collection.description}
                            </p>
                        </div>

                        {collection?.permissions?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {collection.permissions.map((permission) => (
                                    <Badge
                                        key={`${collection.title}-${permission}`}
                                        variant="outline"
                                        className="border-primary/30 bg-background text-primary"
                                    >
                                        {JSON.stringify(permission)}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-2 text-xs text-muted-foreground">
                                {collection.emptyLabel}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PermissionCollectionsSection;
