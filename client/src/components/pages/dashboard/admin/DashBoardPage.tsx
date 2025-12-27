"use client";

import {
    Bell,
    LogOut,
    Plus,
    Search
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { cn } from "@/lib/utils";
import { CheckPermission, collectPermissions } from "@/lib/utils/permissions";
import { approvalStatusEnum, type User } from "@/services/auth";
import { usersQueries } from "@/services/users/index";
import type { UsersQueryParams } from "@/services/users/queries";
import { useAuthStore } from "@/store/auth";
import UsersPage from "./UsersPage";
import type { UserRow } from "./types";
import OverviewWidgets from "./OverviewWidgets";
import { adminUtils, PermissionKey, RolePermission } from "./utils";


function DashBoardPage() {


    const user = useAuthStore((state) => state.user);
    const permissionSet = useMemo(() => collectPermissions(user), [user]);
    const CanManageUser = CheckPermission({
        carrier: permissionSet,
        requirement: PERMISSIONS.USER_MANAGE,
    });

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const queryParams: UsersQueryParams = { page, limit };

    const {
        data,
        isLoading: isLoadingUsers,
        isError: isUsersError,
        error: usersError,
    } = usersQueries.useGetUsers(queryParams);


    const [activeSection, setActiveSection] = useState(adminUtils.sidebarItems[0].value);
    const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(adminUtils.initialRolePermissions);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState<string | null>(null);

    const sectionTitle = useMemo(() => {
        const selected = adminUtils.sidebarItems.find((item) => item.value === activeSection);
        return selected?.label ?? "overview";
    }, [activeSection]);

    const users = useMemo(() => data?.users || [], [data?.users]);

    useEffect(() => {
        if (!data?.users || data.users.length === 0) return;
        if (process.env.NODE_ENV === "production") return;
        console.debug("[AdminDashboard] Users payload", data.users);
    }, [data?.users]);
    const pagination = useMemo(
        () =>
            data?.pagination || {
                total: 0,
                page,
                limit,
                totalPages: 1,
                hasPrev: page > 1,
                hasNext: false,
            },
        [data?.pagination, page, limit],
    );

    const stats = useMemo(() => {
        if (!users || users.length === 0) {
            return adminUtils.quickStats;
        }
        const totalUsers = users.length;
        const verifiedUsers = users.filter((user: User) => user.isEmailVerified).length;
        const pendingApprovals = users.filter((user: User) => user.approvalStatus === approvalStatusEnum.PENDING).length;
        const bannedUsers = users.filter((user: User) => user.isBanned).length;

        return [
            {
                label: "Total Users",
                value: totalUsers?.toLocaleString(),
                trend: `${verifiedUsers} verified accounts`,
                bgColor: "bg-primary/10",
                border: "border-primary/10",
            },
            {
                label: "Pending Approval",
                value: pendingApprovals?.toLocaleString(),
                trend: pendingApprovals ? "Needs review" : "All approved",
                bgColor: "bg-yellow-500/10",
                border: "border-yellow-500/10",
            },
            {
                label: "Banned Accounts",
                value: bannedUsers?.toLocaleString(),
                trend: bannedUsers ? "Action required" : "No bans active",
                bgColor: "bg-red-500/10",
                border: "border-red-500/10",
            },
        ];
    }, [users]);

    const userRows = useMemo<UserRow[]>(() => {
        if (!users) return [];
        return users.map(adminUtils.mapApiUserToRow);
    }, [users]);

    const recentUsers = useMemo(() => adminUtils.buildRecentUsers(userRows), [userRows]);
    const activityFeed = useMemo(() => adminUtils.buildActivityFeed(userRows), [userRows]);
    const courseInsights = useMemo(() => adminUtils.buildCourseInsights(userRows), [userRows]);
    const banSummary = useMemo(() => adminUtils.buildBanSummary(userRows), [userRows]);

    const shouldFallbackToMock = !users?.length && !isLoadingUsers && !isUsersError;
    let rowsToRender: UserRow[] = shouldFallbackToMock ? adminUtils.mockUsers : userRows;

    // Apply search and role filter
    if (searchQuery.trim() || filterRole) {
        rowsToRender = rowsToRender.filter((user: UserRow) => {
            const matchesSearch = searchQuery.trim() === "" ||
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = !filterRole || user.roleLabel === filterRole;
            return matchesSearch && matchesRole;
        });
    }

    const handleTogglePermission = (role: string, permissionKey: PermissionKey, checked: boolean) => {
        setRolePermissions((prev) =>
            prev.map((entry) =>
                entry.role === role
                    ? {
                        ...entry,
                        permissions: { ...entry.permissions, [permissionKey]: checked },
                    }
                    : entry,
            ),
        );
    };


    return (
        <div className="bg-muted/30 flex min-h-screen">
            <aside className="hidden w-64 flex-col border-r `bg-linear-to-b from-primary/5 to-background/80 p-6 lg:flex">
                <div className="mb-8 space-y-2 rounded-lg bg-primary/10 p-3">
                    <p className="text-xs uppercase text-primary font-semibold">🔐 Admin Panel</p>
                    <h1 className="text-lg font-bold text-primary">EduApp Admin</h1>
                    <p className="text-xs text-muted-foreground">Full system control</p>
                </div>
                <nav className="space-y-2">
                    {adminUtils.sidebarItems.map(({ label, icon: Icon, value }) => (
                        <button
                            key={value}
                            onClick={() => setActiveSection(value)}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                                activeSection === value
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted",
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </nav>
                <div className="mt-auto space-y-3">
                    <Separator />
                    <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" size="sm">
                        <LogOut className="h-4 w-4" />
                        Log out
                    </Button>
                </div>
            </aside>
            <main className="flex-1">
                <header className="border-b bg-linear-to-r from-primary/5 via-background/80 to-background/80 px-4 py-4 backdrop-blur md:px-8">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm text-primary font-semibold">🛡️ Admin Dashboard</p>
                            <h2 className="text-2xl font-bold tracking-tight text-primary">{sectionTitle}</h2>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            {activeSection === "users" && (
                                <div className="relative w-full max-w-xs">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-9 pl-10 pr-3 text-sm"
                                    />
                                </div>

                            )}
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Invite user
                            </Button>
                        </div>
                    </div>
                </header>
                <div className="space-y-6 px-4 py-6 md:px-8">
                    {activeSection === "overview" && (
                        <OverviewWidgets
                            stats={stats}
                            recentUsers={recentUsers}
                            activityFeed={activityFeed}
                            courseInsights={courseInsights}
                            banSummary={banSummary}
                            titlePrefix="Admin "
                        />
                    )}

                    {activeSection === "users" && (
                        <UsersPage
                            filterRole={filterRole}
                            setFilterRole={setFilterRole}
                            page={page}
                            setPage={setPage}
                            limit={limit}
                            setLimit={setLimit}
                            pagination={pagination}
                            rowsToRender={rowsToRender}
                            isLoadingUsers={isLoadingUsers}
                            isUsersError={isUsersError}
                            usersError={usersError}
                            CanManageUser={CanManageUser}
                        />
                    )}


                    {activeSection === "permissions" && (
                        <section>
                            <Card>
                                <CardHeader>
                                    <CardTitle>🔑 Role permissions</CardTitle>
                                    <CardDescription>Define granular access control for all roles</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-[1.5fr_repeat(4,minmax(90px,1fr))] items-center gap-4 text-xs font-medium uppercase text-muted-foreground">
                                        <span>Role</span>
                                        {adminUtils.permissionScopes.map((scope) => (
                                            <span key={scope.key}>{scope.label}</span>
                                        ))}
                                    </div>
                                    <Separator />
                                    <div className="space-y-4">
                                        {rolePermissions.map((entry) => (
                                            <div
                                                key={entry.role}
                                                className="grid grid-cols-[1.5fr_repeat(4,minmax(90px,1fr))] items-center gap-4 rounded-xl border p-4"
                                            >
                                                <div>
                                                    <p className="font-medium">{entry.role}</p>
                                                    <p className="text-sm text-muted-foreground">{entry.description}</p>
                                                </div>
                                                {adminUtils.permissionScopes.map((scope) => (
                                                    <div key={`${entry.role}-${scope.key}`} className="flex items-center justify-center">
                                                        <Switch
                                                            checked={entry.permissions[scope.key]}
                                                            onCheckedChange={(checked) =>
                                                                handleTogglePermission(entry.role, scope.key, checked)
                                                            }
                                                            aria-label={`${scope.label} permission for ${entry.role}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="justify-end gap-3">
                                    <Button variant="outline">Discard</Button>
                                    <Button>Save changes</Button>
                                </CardFooter>
                            </Card>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}

export default DashBoardPage;