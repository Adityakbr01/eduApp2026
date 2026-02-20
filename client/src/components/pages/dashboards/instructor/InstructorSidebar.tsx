"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Bell, LogOut } from "lucide-react";
import { instructorSidebarItems, InstructorSidebarValue } from "./utils";

interface InstructorSidebarProps {
  activeSection: InstructorSidebarValue;
  setActiveSection: (section: InstructorSidebarValue) => void;
  onLogout: () => void;
  isOpen: boolean; // NEW: mobile open state
  onClose: () => void; // NEW: close handler
}

export function InstructorSidebar({
  activeSection,
  setActiveSection,
  onLogout,
  isOpen,
  onClose,
}: InstructorSidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed z-50 h-full w-64 bg-background border-r transition-transform lg:static lg:translate-x-0 flex flex-col p-6",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="mb-8 space-y-2 rounded-lg bg-primary/10 p-3">
          <p className="text-xs uppercase text-primary font-semibold">
            🎓 INSTRUCTOR Panel
          </p>
          <p className="text-xs text-muted-foreground">Manage your courses</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {instructorSidebarItems.map(({ label, icon: Icon, value }) => (
            <button
              key={value}
              onClick={() => {
                setActiveSection(value);
                onClose(); // CLOSE on mobile
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                activeSection === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
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
            onClick={onLogout}
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
