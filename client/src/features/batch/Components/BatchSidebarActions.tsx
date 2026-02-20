"use client";

import { useState, useEffect } from "react";
import { secureLocalStorage } from "@/lib/utils/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage";
import {
  Trophy,
  Award,
  Bookmark,
  PauseCircle,
  LogOut,
  PanelLeftClose,
  PanelRightClose,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BatchSidebarActionsProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const SIDEBAR_ACTIONS = [
  {
    id: "leaderboard",
    title: "Leaderboard",
    icon: <Trophy className="w-5 h-5" />,
    color: "group-hover:text-primary",
    activeColor: "text-primary",
    bg: "hover:bg-primary/10",
    activeBg: "bg-primary/20",
  },
  {
    id: "certificate",
    title: "Certificate",
    icon: <Award className="w-5 h-5" />,
    color: "group-hover:text-amber-400",
    activeColor: "text-amber-400",
    bg: "hover:bg-amber-400/10",
    activeBg: "bg-amber-400/20",
  },
  {
    id: "bookmarks",
    title: "Bookmarks",
    icon: <Bookmark className="w-5 h-5" />,
    color: "group-hover:text-emerald-400",
    activeColor: "text-emerald-400",
    bg: "hover:bg-emerald-400/10",
    activeBg: "bg-emerald-400/20",
  },
  {
    id: "batch-hold",
    title: "Batch Hold",
    icon: <PauseCircle className="w-5 h-5" />,
    color: "group-hover:text-orange-400",
    activeColor: "text-orange-400",
    bg: "hover:bg-orange-400/10",
    activeBg: "bg-orange-400/20",
  },
  {
    id: "opt-out",
    title: "Opt-Out",
    icon: <LogOut className="w-5 h-5" />,
    color: "group-hover:text-red-400",
    activeColor: "text-red-400",
    bg: "hover:bg-red-400/10",
    activeBg: "bg-red-400/20",
  },
];

const BatchSidebarActions = ({
  activeView,
  setActiveView,
}: BatchSidebarActionsProps) => {
  const [isCollapsed, setIsCollapsedState] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Load persistence
  useEffect(() => {
    setIsClient(true);
    const savedCollapsed = secureLocalStorage.getItem<boolean>(
      STORAGE_KEYS.BATCH_SIDEBAR_COLLAPSED,
      true,
    );
    if (savedCollapsed !== null) {
      setIsCollapsedState(savedCollapsed);
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsedState(newState);
    secureLocalStorage.setItem(STORAGE_KEYS.BATCH_SIDEBAR_COLLAPSED, newState);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "transition-all duration-300",
          // Mobile: Just a row of buttons (no fixed positioning)
          "w-full flex flex-row items-center justify-around p-2 gap-2 bg-dark-card border border-white/5 rounded-xl mb-4",
          // Desktop: Sidebar
          "xl:static xl:bg-dark-card xl:border xl:border-white/5 xl:rounded-2xl xl:p-3 xl:flex-col xl:h-full xl:justify-start xl:gap-2 xl:mb-0",
          isCollapsed ? "xl:w-20 xl:items-center" : "xl:w-64",
        )}
      >
        {/* Collapse Toggle (Desktop Only) */}
        <div
          className={cn(
            "hidden xl:flex w-full mb-4 px-2",
            isCollapsed ? "justify-center" : "justify-end",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="text-white/50  hover:text-white hover:bg-white/5"
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftClose className="w-5 h-5 rotate-180" />
            ) : (
              <PanelRightClose className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Actions */}
        {SIDEBAR_ACTIONS.map((action) => {
          const isActive = activeView === action.id;

          // Hide mobile-only items on desktop
          const visibilityClass = (action as any).mobileOnly
            ? "flex xl:hidden"
            : "flex";

          // Base Button Component
          const button = (
            <Button
              key={action.id}
              variant="ghost"
              onClick={() => setActiveView(action.id)}
              className={cn(
                "group transition-all relative ",

                // Mobile
                "flex flex-col items-center gap-1 p-2 rounded-lg w-full",
                isActive ? "bg-white/10 text-white" : "text-white/50",

                // Desktop
                "xl:h-12 xl:flex-row xl:justify-start xl:gap-3 xl:px-3",

                // Active State Styling (Desktop)
                isActive
                  ? `btn-primary cursor-pointer xl:text-white`
                  : `xl:bg-transparent xl:${action.bg} xl:text-white/50`,

                // Collapsed State Styling (Desktop)
                isCollapsed ? "xl:w-12 xl:justify-center xl:px-0" : "xl:w-full",
              )}
            >
              <span
                className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-white" : `text-${action.color}-400`,
                )}
              >
                {action.icon}
              </span>

              {!isCollapsed && (
                <span className="hidden xl:inline text-sm font-medium truncate">
                  {action.title}
                </span>
              )}

              {/* Mobile Label */}
              <span className="text-[10px] xl:hidden">{action.title}</span>
            </Button>
          );

          // Render Logic
          // 1. If Collapsed: We need to render Mobile (normal) AND Desktop (Tooltip)
          if (isCollapsed) {
            return (
              <div key={action.id} className={cn("contents", visibilityClass)}>
                {/* Mobile: Just show the button (The button's own classes handle mobile styling) */}
                {/* However, the 'button' const has 'xl:w-12' hardcoded if isCollapsed is true. 
                         That's fine, 'xl:' classes don't affect mobile 'w-full'. 
                         But we need to make sure we don't wrap it in 'hidden xl:block' for mobile. 
                     */}

                {/* Wrapper to handle visibility on Mobile vs Desktop */}
                <div
                  className={cn("w-full flex justify-center", visibilityClass)}
                >
                  {/* On Desktop, wrap with Tooltip. On Mobile, just Button. */}

                  {/* Since Tooltip only works with a single child, and we want it mainly for Desktop hover
                            We can condition the Tooltip wrapper or render two separate blocks? 
                            Rendering two blocks is safer for layout.
                        */}

                  {/* Mobile Version (Visible only on Mobile) */}
                  <div className="xl:hidden w-full">{button}</div>

                  {/* Desktop Version (Visible only on Desktop) */}
                  <div className="hidden xl:block">
                    <Tooltip>
                      <TooltipTrigger asChild>{button}</TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-dark-card border-white/10 text-white"
                      >
                        <p>{action.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            );
          }

          // 2. If Expanded: Standard Render (Button handles its own responsiveness)
          return (
            <div
              key={action.id}
              className={cn("xl:w-full justify-center", visibilityClass)}
            >
              {button}
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default BatchSidebarActions;
