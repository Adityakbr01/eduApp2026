"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { user_roles } from "@/constants/roles";
import { adminUtils } from "@/features/dashboards/common/utils";
import { cn } from "@/lib/utils";
import { Bell, LogOut, X } from "lucide-react";

interface Props {
  setActiveSection: (
    section: (typeof adminUtils.sidebarItems)[number]["value"],
  ) => void;
  activeSection: (typeof adminUtils.sidebarItems)[number]["value"];
  logout: {
    mutate: () => void;
  };
  isOpen?: boolean;
  onClose?: () => void;
}

function DashBoardSideBar({
  setActiveSection,
  activeSection,
  logout,
  isOpen,
  onClose,
}: Props) {
  const handleNavClick = (
    value: (typeof adminUtils.sidebarItems)[number]["value"],
  ) => {
    setActiveSection(value);
    // Close sidebar on mobile after navigation
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/95 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex-col border-r bg-linear-to-b from-primary/10 to-background/80 p-6 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:flex lg:translate-x-0",
          isOpen ? "translate-x-0 flex" : "-translate-x-full",
        )}
      >
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute right-3 top-3 lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="mb-8 space-y-2 rounded-lg bg-primary/10 p-3">
          <p className="text-xs uppercase text-primary font-semibold">
            🔐 {user_roles.ADMIN.toUpperCase()} ||{" "}
            {user_roles.MANAGER.toUpperCase()} Panel
          </p>
          <p className="text-xs text-muted-foreground">Full system control</p>
        </div>
        <nav className="space-y-2">
          {adminUtils.sidebarItems.map(({ label, icon: Icon, value }) => (
            <button
              key={value}
              onClick={() => handleNavClick(value)}
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
        {/* sidebar footer */}
        <div className="mt-auto space-y-3">
          <Separator />
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            size="sm"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </Button>
          <Button
            onClick={() => logout.mutate()}
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive"
            size="sm"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>
    </>
  );
}

export default DashBoardSideBar;
