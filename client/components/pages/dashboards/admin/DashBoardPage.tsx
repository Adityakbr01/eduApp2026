"use client";

import { useEffect, useMemo, useState } from "react";

import app_permissions from "@/constants/permissions";
import { useSyncPermissionsToStore } from "@/hooks/useSyncPermissionsToStore";
import { CheckPermission } from "@/lib/utils/permissions";
import { approvalStatusEnum, User } from "@/services/auth";
import { useLogout } from "@/services/auth/mutations";
import usersQueries, { UsersQueryParams } from "@/services/users/queries";
import { useEffectivePermissions } from "@/store/myPermission";
import { UserRow } from "../common/types";
import { adminUtils, PermissionKey, RolePermission } from "../common/utils";
import DashBoardSideBar from "./DashBoardSideBar";
import DashboardContent from "./DashboardContent";

function DashBoardPage() {
    const logout = useLogout();

    // Sync permissions from API to Zustand store
    useSyncPermissionsToStore();

    // Access permissions from global Zustand store
    const effectivePermissions = useEffectivePermissions();

    const CanReadUser = CheckPermission({
        carrier: effectivePermissions,
        requirement: app_permissions.READ_USERS,
    });


    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const queryParams: UsersQueryParams = { page, limit };

    const {
        data,
        isLoading: isLoadingUsers,
        isError: isUsersError,
        error: usersError,
    } = usersQueries.useGetUsers(queryParams, {
        enabled: Boolean(CanReadUser),
    });

    const [activeSection, setActiveSection] = useState(adminUtils.sidebarItems[0].value);
    const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(adminUtils.initialRolePermissions);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState<string | null>(null);

    const activeSectionItem = useMemo(() => {
        return adminUtils.sidebarItems.find((item) => item.value === activeSection) ?? adminUtils.sidebarItems[0];
    }, [activeSection]);

    const users = useMemo(() => data?.users || [], [data?.users]);

    useEffect(() => {
        if (!data?.users || data.users.length === 0) return;
        if (process.env.NODE_ENV === "production") return;
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
    const noPermissionToReadUsers = !CanReadUser;
    let rowsToRender: UserRow[] = (shouldFallbackToMock || noPermissionToReadUsers) ? adminUtils.mockUsers : userRows;

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
        <div className="bg-muted/30 flex h-screen overflow-hidden">
            <DashBoardSideBar setActiveSection={setActiveSection} activeSection={activeSection} logout={logout} />
            <DashboardContent
                activeSection={activeSection}
                activeSectionItem={activeSectionItem}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                noPermissionToReadUsers={noPermissionToReadUsers}
                stats={stats}
                recentUsers={recentUsers}
                activityFeed={activityFeed}
                courseInsights={courseInsights}
                banSummary={banSummary}
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
                rolePermissions={rolePermissions}
                handleTogglePermission={handleTogglePermission}
            />
        </div>
    );
}

export default DashBoardPage;