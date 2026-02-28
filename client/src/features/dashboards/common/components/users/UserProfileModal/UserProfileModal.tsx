"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import UserInfoTab from "./UserInfoTab/UserInfoTab";
import UserAccessTab from "./UserAccessTab";
import { UserRow } from "../../../types";
import { useUserProfileModal } from "./useUserProfileModal";

type UserProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserRow;
};

function UserProfileModal({ open, onOpenChange, user }: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState("info");
  const dialogContentRef = useRef<HTMLDivElement | null>(null);
  const tabPanelsRef = useRef<Record<string, HTMLDivElement | null>>({});

  const {
    canManageUser,
    canManageUserPermission,
    activeRoles,
    infoItems,
    permissionCollections,
    debuggerPayload,
    targetUserId,
    isLoadingPermissions,
    queryError,
    permissionOptions,
    customPermissionSnapshot,
    permissionForm,
    removePermissionForm,
    onAssignPermission,
    onRemovePermission,
    isPermissionActionDisabled,
    isRemoveActionDisabled,
    assignPending,
    deletePending,
  } = useUserProfileModal(user, open);

  useEffect(() => {
    if (!open) return;
    const panel = tabPanelsRef.current[activeTab];
    if (!panel) return;
    const children = Array.from(panel.children);
    if (!children.length) return;
    gsap.fromTo(
      children,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.06 },
    );
  }, [activeTab, open]);

  const registerTabPanel = (key: string) => (node: HTMLDivElement | null) => {
    tabPanelsRef.current[key] = node;
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setActiveTab("info");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={dialogContentRef}
        className="flex max-h-[85vh] flex-col overflow-y-scroll border border-border/70 bg-background/95 shadow-2xl backdrop-blur sm:max-w-2xl"
      >
        <DialogHeader data-animate="section">
          <DialogTitle>User profile</DialogTitle>
          <DialogDescription>
            A quick snapshot of account details and current access levels.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-4 flex h-full flex-col"
        >
          <TabsList
            data-animate="section"
            className="w-full justify-start gap-2 rounded-none border-none bg-transparent p-0"
          >
            <TabsTrigger
              value="info"
              className="group inline-flex items-center gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <UserRound className="h-4 w-4 text-muted-foreground group-data-[state=active]:text-primary" />
              User Info
            </TabsTrigger>
            <TabsTrigger
              value="access"
              className="group inline-flex items-center gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <ShieldCheck className="h-4 w-4 text-muted-foreground group-data-[state=active]:text-primary" />
              Permissions & Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4 flex-1 overflow-auto">
            <UserInfoTab
              panelRef={registerTabPanel("info")}
              displayName={user.name ?? user.email ?? ""}
              infoItems={infoItems}
            />
          </TabsContent>

          <TabsContent value="access" className="mt-4 flex-1 overflow-auto">
            <UserAccessTab
              panelRef={registerTabPanel("access")}
              activeRoles={activeRoles}
              permissionCollections={permissionCollections}
              debuggerPayload={debuggerPayload}
              canManageUser={canManageUser}
              manualOverrides={{
                targetUserId,
                isLoadingPermissions,
                queryError,
                permissionOptions,
                customPermissions: customPermissionSnapshot,
                permissionForm,
                removePermissionForm,
                onAssignPermission,
                onRemovePermission,
                isPermissionActionDisabled,
                isRemoveActionDisabled,
                assignPending,
                deletePending,
                canManageUserPermission,
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default UserProfileModal;
