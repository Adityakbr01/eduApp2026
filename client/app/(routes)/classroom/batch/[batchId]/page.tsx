"use client";

import BatchBookmarks from "@/components/Batch/BatchBookmarks";
import BatchCertificate from "@/components/Batch/BatchCertificate";
import BatchLeaderboard from "@/components/Batch/BatchLeaderboard";
import BatchModules from "@/components/Batch/BatchModules";
import BatchProgress from "@/components/Batch/BatchProgress";
import BatchSidebarActions from "@/components/Batch/BatchSidebarActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STORAGE_KEYS } from "@/lib/constants/storage";
import { secureLocalStorage } from "@/lib/utils/storage";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

// Mock Data (Ideally mocked here or fetched)
const BATCH_DATA = {
  title: "2.0 Job Ready AI Powered Cohort",
  progress: 4.43,
  modules: 4,
  totalModules: 7,
  subModules: 106,
  totalSubModules: 217,
  score: 1164,
  totalScore: 26290,
};

const MODULES = [
  {
    id: "m0",
    title: "Before We Start",
    completed: true,
    items: [
      {
        id: "i1",
        title: "Orientation Session",
        type: "video" as const,
        overdue: true,
        daysLate: 143,
        penalty: 30,
      },
      {
        id: "i2",
        title: "Platform and Discord Overview",
        type: "video" as const,
        overdue: true,
        daysLate: 142,
        penalty: 30,
      },
      {
        id: "i3",
        title: "VScode Setup",
        type: "video" as const,
        overdue: true,
        daysLate: 141,
        penalty: 30,
      },
    ],
  },
  {
    id: "m1",
    title: "Git & GitHub",
    completed: true,
    items: [
      {
        id: "i4",
        title: "What-is-git",
        type: "video" as const,
        overdue: true,
        daysLate: 140,
        penalty: 30,
      },
      {
        id: "i5",
        title: "How-to-setup-git",
        type: "video" as const,
        overdue: true,
        daysLate: 139,
        penalty: 30,
      },
      {
        id: "i6",
        title: "how-to-use-git",
        type: "video" as const,
        overdue: true,
        daysLate: 138,
        penalty: 30,
      },
    ],
  },
  {
    id: "m2",
    title: "Front-End",
    completed: true,
    items: [
      {
        id: "i7",
        title: "1 - How Internet Works?",
        type: "video" as const,
        overdue: true,
        daysLate: 135,
        penalty: 30,
      },
      {
        id: "i8",
        title: "2 - Client-Server Model",
        type: "video" as const,
        overdue: true,
        daysLate: 134,
        penalty: 30,
      },
      {
        id: "i9",
        title: "3 - Internet Protocols",
        type: "video" as const,
        overdue: true,
        daysLate: 133,
        penalty: 30,
      },
      // ... more items
    ],
  },
  {
    id: "m3",
    title: "Backend",
    completed: false,
    items: [
      {
        id: "i_b1",
        title: "84 | Origin-2.0",
        type: "video" as const,
        overdue: true,
        daysLate: 14,
        penalty: 30,
      },
      {
        id: "i_b2",
        title: "85 | Baat Cheet",
        type: "video" as const,
        overdue: true,
        daysLate: 13,
        penalty: 30,
      },
      {
        id: "i_b3",
        title: "97 | JWT",
        type: "video" as const,
        deadline: "February 7, 2026, 12:00 am",
      },
      {
        id: "i_b4",
        title: "98 | Bcrypt.js",
        type: "locked" as const,
        start: "February 8, 2026, 12:00 am",
      },
    ],
  },
];

const BatchDetailPage = () => {
  // Use state with default "overview"
  const [activeSidebarView, setActiveSidebarViewState] = useState("overview");
  const [mobileTab, setMobileTabState] = useState("overview");
  const [isClient, setIsClient] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    setIsClient(true);

    // Load Active View (Tools)
    const savedView = secureLocalStorage.getItem<string>(
      STORAGE_KEYS.BATCH_ACTIVE_VIEW,
      "overview",
    );
    if (savedView) {
      setActiveSidebarViewState(savedView);
    }

    // Load Mobile Tab (Overview vs Other)
    const savedMobileTab = secureLocalStorage.getItem<string>(
      STORAGE_KEYS.BATCH_MOBILE_TAB,
      "overview",
    );
    if (savedMobileTab) {
      setMobileTabState(savedMobileTab);
    }
  }, []);

  // Wrapper to save Active View to storage
  const setActiveSidebarView = (view: string) => {
    setActiveSidebarViewState(view);
    secureLocalStorage.setItem(STORAGE_KEYS.BATCH_ACTIVE_VIEW, view);
  };

  // Wrapper to save Mobile Tab to storage
  const setMobileTab = (tab: string) => {
    setMobileTabState(tab);
    secureLocalStorage.setItem(STORAGE_KEYS.BATCH_MOBILE_TAB, tab);
  };

  // Prevent hydration mismatch by rendering default until client loads (or just render default)
  // Actually, for layout stability, we can just render. state updates safely.

  return (
    <div className="relative h-auto min-h-screen xl:h-screen flex flex-col xl:flex-row w-full bg-[#171717] py-6 px-4 md:px-6 gap-6 text-white overflow-y-auto xl:overflow-hidden pb-24 xl:pb-6">
      <div className="w-full h-full xl:flex xl:gap-6">
        {/* MOBILE VIEW: TABS */}
        <div className="xl:hidden w-full h-full flex flex-col">
          <Tabs
            value={mobileTab}
            onValueChange={setMobileTab}
            className="w-full flex-1 flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2 bg-dark-card border border-white/5 mb-6 shrink-0">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB: Content */}
            <TabsContent
              value="overview"
              className="mt-0 flex-1 overflow-y-auto custom-scrollbar pb-10"
            >
              <div className="flex flex-col gap-6">
                <BatchProgress data={BATCH_DATA} />
                <BatchModules modules={MODULES} />
              </div>
            </TabsContent>

            {/* OTHER TAB: Tools + Actions */}
            <TabsContent
              value="other"
              className="mt-0 flex-1 flex flex-col gap-4 overflow-hidden"
            >
              {/* Selector (Reusing Sidebar Actions as a Menu) */}
              <div className="shrink-0">
                <BatchSidebarActions
                  activeView={activeSidebarView}
                  setActiveView={setActiveSidebarView}
                />
              </div>

              {/* Dynamic Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-dark-card/50 rounded-xl border border-white/5 p-4">
                {activeSidebarView === "leaderboard" && <BatchLeaderboard />}
                {activeSidebarView === "certificate" && <BatchCertificate />}
                {activeSidebarView === "bookmarks" && <BatchBookmarks />}
                {activeSidebarView === "overview" && (
                  <div className="flex flex-col items-center justify-center h-full text-white/50">
                    <Trophy className="w-12 h-12 mb-2 opacity-20" />
                    <p>Select an item above</p>
                  </div>
                )}
                {["batch-hold", "opt-out"].includes(activeSidebarView) && (
                  <div className="flex flex-col items-center justify-center h-full text-white/50">
                    <span className="text-lg font-medium">Coming Soon</span>
                    <p className="text-sm">
                      This feature is under development.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* DESKTOP VIEW: SPLIT LAYOUT */}
        {/* Left Column (Static) */}
        <div className="hidden xl:flex flex-col gap-6 w-[55%] h-full overflow-y-auto custom-scrollbar pb-10">
          <BatchProgress data={BATCH_DATA} />
          <BatchModules modules={MODULES} />
        </div>

        {/* Right Column (Dynamic) */}
        <div className="hidden xl:flex flex-row gap-6 w-[45%] h-full">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {activeSidebarView === "leaderboard" && <BatchLeaderboard />}
            {activeSidebarView === "certificate" && <BatchCertificate />}
            {activeSidebarView === "bookmarks" && <BatchBookmarks />}
            {/* Fallback */}
            {activeSidebarView === "overview" && <BatchLeaderboard />}

            {["batch-hold", "opt-out"].includes(activeSidebarView) && (
              <div className="bg-dark-card rounded-2xl border border-white/5 w-full h-full flex flex-col items-center justify-center p-6 text-white/50">
                <span className="text-lg font-medium">Coming Soon</span>
                <p className="text-sm">This feature is under development.</p>
              </div>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className="w-auto shrink-0">
            <BatchSidebarActions
              activeView={activeSidebarView}
              setActiveView={setActiveSidebarView}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchDetailPage;
