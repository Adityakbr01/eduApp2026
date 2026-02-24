import { UserRow } from "@/features/dashboards/common/types";
import {
  ActivityFeedItem,
  adminUtils,
  PermissionKey,
  RecentUserItem,
  RolePermission,
} from "@/features/dashboards/common/utils";
import UsersPage from "@/features/dashboards/common/pages/UsersPage";
import PermissionDeniedOverlay from "@/components/PermissionDenidOverlay";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction } from "react";
import CoursesPage from "../../pages/CoursesPage";
import OverviewWidgets from "../widgets/OverviewWidgets";
import DashBoardHeader from "./DashBoardHeader";

const LiveAccessPage = dynamic(
  () => import("../../pages/LiveAccessPage").then((mod) => mod.default),
  { ssr: false },
);

const EmailMarketingPage = dynamic(
  () => import("../../pages/EmailMarketingPage").then((mod) => mod.default),
  { ssr: false },
);

const PushNotificationPage = dynamic(
  () => import("../../pages/PushNotificationPage").then((mod) => mod.default),
  { ssr: false },
);

interface DashboardContentProps {
  activeSection: string;
  activeSectionItem: (typeof adminUtils.sidebarItems)[number];
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  noPermissionToReadUsers: boolean;
  stats: {
    label: string;
    value: string;
    trend: string;
    bgColor: string;
    border: string;
  }[];
  recentUsers: RecentUserItem[];
  activityFeed: ActivityFeedItem[];
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
  rowsToRender: UserRow[];
  isLoadingUsers: boolean;
  isUsersError: boolean;
  usersError: Error | null;
  rolePermissions: RolePermission[];
  handleTogglePermission: (
    role: string,
    permissionKey: PermissionKey,
    checked: boolean,
  ) => void;
  onMenuClick?: () => void;
}

function DashboardContent({
  activeSection,
  activeSectionItem,
  searchQuery,
  setSearchQuery,
  noPermissionToReadUsers,
  stats,
  recentUsers,
  activityFeed,
  filterRole,
  setFilterRole,
  page,
  setPage,
  limit,
  setLimit,
  pagination,
  rowsToRender,
  isLoadingUsers,
  isUsersError,
  usersError,
  onMenuClick,
}: DashboardContentProps) {
  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <DashBoardHeader
        sectionTitle={activeSectionItem.label}
        activeSection={activeSectionItem}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onMenuClick={onMenuClick}
      />
      <div className="flex-1 overflow-y-auto space-y-6 px-4 py-6 md:px-8">
        {activeSection === adminUtils.sidebarItems[0].value && (
          <div className="relative">
            {noPermissionToReadUsers && <PermissionDeniedOverlay />}
            <div
              className={cn(
                noPermissionToReadUsers && "pointer-events-none select-none",
              )}
            >
              <OverviewWidgets
                stats={stats}
                recentUsers={recentUsers}
                activityFeed={activityFeed}
                titlePrefix="Admin"
              />
            </div>
          </div>
        )}

        {activeSection === adminUtils.sidebarItems[1].value && (
          <div className="relative">
            {noPermissionToReadUsers && <PermissionDeniedOverlay />}
            <div
              className={cn(
                noPermissionToReadUsers && "pointer-events-none select-none",
              )}
            >
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
              />
            </div>
          </div>
        )}

        {activeSection === adminUtils.sidebarItems[2].value && (
          <div className="min-h-screen overflow-y-auto">
            <CoursesPage />
          </div>
        )}

        {activeSection === adminUtils.sidebarItems[3].value && (
          <div className="min-h-screen overflow-y-auto">
            <LiveAccessPage />
          </div>
        )}

        {activeSection === adminUtils.sidebarItems[4].value && (
          <div className="min-h-screen h-screen overflow-y-auto">
            <EmailMarketingPage />
          </div>
        )}

        {activeSection === adminUtils.sidebarItems[5].value && (
          <div className="min-h-screen overflow-y-auto">
            <PushNotificationPage />
          </div>
        )}
      </div>
    </main>
  );
}

export default DashboardContent;
