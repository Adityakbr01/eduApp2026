"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useRef, type Dispatch, type SetStateAction } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES } from "@/validators/auth.schema";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { UserRow } from "./types";
import { UserActionsMenu } from "./UserActionsMenu";

type UsersProps = {
    filterRole: string | null;
    setFilterRole: Dispatch<SetStateAction<string | null>>;

    page: number;
    setPage: Dispatch<SetStateAction<number>>;

    limit: number;
    setLimit: Dispatch<SetStateAction<number>>;

    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasPrev: boolean;
        hasNext: boolean;
    };

    isLoadingUsers?: boolean;
    isUsersError?: boolean;
    usersError?: Error | null;
    rowsToRender?: UserRow[];
    CanManageUser?: boolean
};


function UsersPage({
    filterRole,
    setFilterRole,
    page,
    setPage,
    limit,
    setLimit,
    pagination,
    isLoadingUsers,
    isUsersError,
    usersError,
    rowsToRender,
    CanManageUser,
}: UsersProps) {
    const tableBodyRef = useRef<HTMLTableSectionElement>(null);

    // GSAP animation
    useGSAP(
        () => {
            if (!tableBodyRef.current) return;

            const rows = tableBodyRef.current.querySelectorAll("tr");

            gsap.fromTo(
                rows,
                {
                    opacity: 0,
                    y: 18,
                    filter: "blur(8px)",
                },
                {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    duration: 0.55,
                    stagger: 0.06,
                    ease: "power3.out",
                }
            );
        },
        {
            dependencies: [rowsToRender], // animate on new rows
            scope: tableBodyRef, // GSAP handles cleanup automatically
        }
    );

    const totalItems = pagination?.total ?? 0;
    const fromItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
    const toItem = totalItems === 0 ? 0 : Math.min(page * limit, totalItems);
    const perPageOptions = [5, 10, 25, 50];

    const handleLimitChange = (value: string) => {
        const parsed = Number(value);
        if (Number.isNaN(parsed)) return;
        setLimit(parsed);
        setPage(1); // reset to first page so user is never stranded
    };

    const handlePrev = () => {
        if (!pagination?.hasPrev) return;
        setPage(Math.max(1, page - 1));
    };

    const handleNext = () => {
        if (!pagination?.hasNext) return;
        setPage(Math.min(pagination.totalPages, page + 1));
    };

    return (
        <section className="grid gap-6 lg:grid-cols-[1fr]">
            <Card className="border-none shadow-none bg-transparent flex-1">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>Manage roles, invites, and status</CardDescription>
                    </div>

                    <Select
                        value={filterRole ?? undefined}
                        onValueChange={(value) =>
                            setFilterRole(value === "all" ? null : value)
                        }
                    >
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {Object.values(ROLES).map((role) => (
                                <SelectItem key={role} value={role}>
                                    {role.replace("_", " ").toUpperCase()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden md:table-cell">Last Active</TableHead>
                                {CanManageUser && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>

                        {/* GSAP Animation Target */}
                        <TableBody ref={tableBodyRef}>
                            {isLoadingUsers &&
                                Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={`sk-${i}`}>
                                        <TableCell colSpan={5}>
                                            <div className="flex items-center gap-4">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-1/3" />
                                                    <Skeleton className="h-3 w-1/4" />
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}

                            {isUsersError && (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <p className="text-center text-sm text-destructive">
                                            {usersError?.message || "Failed to load users"}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoadingUsers &&
                                !isUsersError &&
                                rowsToRender?.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 text-sm">
                                                    <AvatarFallback>
                                                        {user.name
                                                            .split(" ")
                                                            .map((c) => c[0])
                                                            .slice(0, 2)
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium leading-none">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant="secondary">{user.roleLabel}</Badge>
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                className={cn("text-xs font-medium", user.status.className)}
                                            >
                                                {user.status.label}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                                            {user.lastActive}
                                        </TableCell>


                                        <TableCell className="text-right">
                                            {CanManageUser && <UserActionsMenu
                                                user={user}
                                                onView={() => { }}
                                            />}
                                        </TableCell>
                                    </TableRow>
                                ))}

                            {!isLoadingUsers &&
                                !isUsersError &&
                                (!rowsToRender || rowsToRender.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <p className="text-center text-sm text-muted-foreground">
                                                No users match the current filters.
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                        </TableBody>
                    </Table>

                    <div className="flex flex-col gap-3 border-t pt-4 text-sm md:flex-row md:items-center md:justify-between">
                        <p className="text-muted-foreground">
                            {totalItems === 0
                                ? "No records to display"
                                : `Showing ${fromItem}–${toItem} of ${totalItems}`}
                        </p>

                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Rows per page</span>
                                <Select value={String(limit)} onValueChange={handleLimitChange}>
                                    <SelectTrigger className="w-[90px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {perPageOptions.map((option) => (
                                            <SelectItem key={option} value={String(option)}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2 self-end md:self-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrev}
                                    disabled={!pagination?.hasPrev || isLoadingUsers}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNext}
                                    disabled={!pagination?.hasNext || isLoadingUsers}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}

export default UsersPage;


