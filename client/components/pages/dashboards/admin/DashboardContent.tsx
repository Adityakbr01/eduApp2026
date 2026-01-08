import PermissionDeniedOverlay from "@/components/PermissionDenidOverlay";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import UsersPage from "../../UsersPage";
import { UserRow } from "../common/types";
import {
  ActivityFeedItem,
  adminUtils,
  CourseInsight,
  PermissionKey,
  RecentUserItem,
  RolePermission
} from "../common/utils";
import AdminCoursesPage from "./AdminCoursesPage";
import DashBoardHeader from "./DashBoardHeader";
import OverviewWidgets from "./OverviewWidgets";

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
    checked: boolean
  ) => void;
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
  rolePermissions,
  handleTogglePermission,
}: DashboardContentProps) {
  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      <DashBoardHeader
        sectionTitle={activeSectionItem.label}
        activeSection={activeSectionItem}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="flex-1 overflow-y-auto space-y-6 px-4 py-6 md:px-8">
        {activeSection === adminUtils.sidebarItems[0].value && (
          <div className="relative">
            {noPermissionToReadUsers && <PermissionDeniedOverlay />}
            <div
              className={cn(
                noPermissionToReadUsers && "pointer-events-none select-none"
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
                noPermissionToReadUsers && "pointer-events-none select-none"
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
          <div>
            <AdminCoursesPage />
          </div>
        )}

        {activeSection === adminUtils.sidebarItems[3].value && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle>🔑 Role permissions</CardTitle>
                <CardDescription>
                  Define granular access control for all roles
                </CardDescription>
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
                        <p className="text-sm text-muted-foreground">
                          {entry.description}
                        </p>
                      </div>
                      {adminUtils.permissionScopes.map((scope) => (
                        <div
                          key={`${entry.role}-${scope.key}`}
                          className="flex items-center justify-center"
                        >
                          <Switch
                            checked={entry.permissions[scope.key]}
                            onCheckedChange={(checked) =>
                              handleTogglePermission(
                                entry.role,
                                scope.key,
                                checked
                              )
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
  );
}

export default DashboardContent;
