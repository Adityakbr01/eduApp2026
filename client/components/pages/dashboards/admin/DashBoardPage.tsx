"use client";

import { useMemo, useState } from "react";

import app_permissions from "@/constants/permissions";
import { useSyncPermissionsToStore } from "@/hooks/useSyncPermissionsToStore";
import { CheckPermission } from "@/lib/utils/permissions";
import { approvalStatusEnum, User } from "@/services/auth";
import { useLogout } from "@/services/auth/mutations";
import { useGetCoursesForAdmin } from "@/services/courses/queries";
import usersQueries, { UsersQueryParams } from "@/services/users/queries";
import { useEffectivePermissions } from "@/store/myPermission";
import { UserRow } from "../common/types";
import { adminUtils, PermissionKey, RolePermission } from "../common/utils";
import DashBoardSideBar from "./DashBoardSideBar";
import DashboardContent from "./DashboardContent";

function DashBoardPage() {
  const logout = useLogout();

  /* -------------------------------- permissions -------------------------------- */
  useSyncPermissionsToStore();
  const effectivePermissions = useEffectivePermissions();

  const canReadUsers = CheckPermission({
    carrier: effectivePermissions,
    requirement: app_permissions.READ_USERS,
  });

  /* -------------------------------- pagination -------------------------------- */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const userQueryParams: UsersQueryParams = useMemo(
    () => ({ page, limit }),
    [page, limit]
  );

  /* -------------------------------- queries -------------------------------- */
  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    isError: isUsersError,
    error: usersError,
  } = usersQueries.useGetUsers(userQueryParams, {
    enabled: canReadUsers,
  });

  // Courses are fetched eagerly (used in Admin Courses section)
  useGetCoursesForAdmin({ page, limit });

  /* -------------------------------- sidebar -------------------------------- */
  const [activeSection, setActiveSection] = useState(
    adminUtils.sidebarItems[0].value
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeSectionItem = useMemo(
    () =>
      adminUtils.sidebarItems.find((item) => item.value === activeSection) ??
      adminUtils.sidebarItems[0],
    [activeSection]
  );

  /* -------------------------------- filters -------------------------------- */
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string | null>(null);

  /* -------------------------------- roles -------------------------------- */
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(
    adminUtils.initialRolePermissions
  );

  /* -------------------------------- users -------------------------------- */
  const users: User[] = useMemo(
    () => usersResponse?.users ?? [],
    [usersResponse?.users]
  );

  const pagination = useMemo(
    () =>
      usersResponse?.pagination ?? {
        total: 0,
        page,
        limit,
        totalPages: 1,
        hasPrev: page > 1,
        hasNext: false,
      },
    [usersResponse?.pagination, page, limit]
  );

  /* -------------------------------- stats -------------------------------- */
  const stats = useMemo(() => {
    if (!users.length) return adminUtils.quickStats;

    const verified = users.filter((u) => u.isEmailVerified).length;
    const pending = users.filter(
      (u) => u.approvalStatus === approvalStatusEnum.PENDING
    ).length;
    const banned = users.filter((u) => u.isBanned).length;

    return [
      {
        label: "Total Users",
        value: users.length.toLocaleString(),
        trend: `${verified} verified accounts`,
        bgColor: "bg-primary/10",
        border: "border-primary/10",
      },
      {
        label: "Pending Approval",
        value: pending.toLocaleString(),
        trend: pending ? "Needs review" : "All approved",
        bgColor: "bg-yellow-500/10",
        border: "border-yellow-500/10",
      },
      {
        label: "Banned Accounts",
        value: banned.toLocaleString(),
        trend: banned ? "Action required" : "No bans active",
        bgColor: "bg-red-500/10",
        border: "border-red-500/10",
      },
    ];
  }, [users]);

  /* -------------------------------- rows -------------------------------- */
  const userRows: UserRow[] = useMemo(
    () => users.map(adminUtils.mapApiUserToRow),
    [users]
  );

  const filteredRows: UserRow[] = useMemo(() => {
    if (!canReadUsers) return adminUtils.mockUsers;

    let rows = userRows;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }

    if (filterRole) {
      rows = rows.filter((u) => u.roleLabel === filterRole);
    }

    return rows;
  }, [canReadUsers, userRows, searchQuery, filterRole]);

  /* -------------------------------- widgets -------------------------------- */
  const recentUsers = useMemo(
    () => adminUtils.buildRecentUsers(userRows),
    [userRows]
  );
  const activityFeed = useMemo(
    () => adminUtils.buildActivityFeed(userRows),
    [userRows]
  );

  /* -------------------------------- handlers -------------------------------- */
  const handleTogglePermission = (
    role: string,
    permissionKey: PermissionKey,
    checked: boolean
  ) => {
    setRolePermissions((prev) =>
      prev.map((entry) =>
        entry.role === role
          ? {
              ...entry,
              permissions: {
                ...entry.permissions,
                [permissionKey]: checked,
              },
            }
          : entry
      )
    );
  };

  /* -------------------------------- render -------------------------------- */
  return (
    <div className="bg-muted/30 flex  h-screen overflow-hidden">
      <DashBoardSideBar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        logout={logout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <DashboardContent
        activeSection={activeSection}
        activeSectionItem={activeSectionItem}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        noPermissionToReadUsers={!canReadUsers}
        stats={stats}
        recentUsers={recentUsers}
        activityFeed={activityFeed}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        pagination={pagination}
        rowsToRender={filteredRows}
        isLoadingUsers={isLoadingUsers}
        isUsersError={isUsersError}
        usersError={usersError}
        rolePermissions={rolePermissions}
        handleTogglePermission={handleTogglePermission}
        onMenuClick={() => setIsSidebarOpen(true)}
      />
    </div>
  );
}

export default DashBoardPage;
