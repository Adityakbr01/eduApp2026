"use client";

import BatchBookmarks from "@/components/Batch/BatchBookmarks";
import BatchCertificate from "@/components/Batch/BatchCertificate";
import BatchLeaderboard from "@/components/Batch/BatchLeaderboard";
import BatchProgress from "@/components/Batch/BatchProgress";
import BatchSidebarActions from "@/components/Batch/BatchSidebarActions";
import SectionModules from "@/components/Batch/Modules/SectionModules";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STORAGE_KEYS } from "@/lib/constants/storage";
import { secureLocalStorage } from "@/lib/utils/storage";
import { useGetBatchDetail } from "@/services/classroom";
import { Loader2, Trophy } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const BatchDetailPage = () => {
  const params = useParams();
  const batchId = params?.batchId as string;

  // Fetch batch detail from API
  const { data, isLoading, isError } = useGetBatchDetail(batchId);
  const batchData = data?.data?.batchData;
  console.log("batchData", data?.data.modules);
  const modules = data?.data?.modules || [];
  const lastVisitedId = data?.data?.lastVisitedId;

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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-[#171717] text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-white/50">Loading batch details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !batchData) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-[#171717] text-white">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-red-400">
            Failed to load batch details. You may not be enrolled in this
            course.
          </p>
        </div>
      </div>
    );
  }

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
            <TabsList className="grid w-full grid-cols-2 bg-dark-card p-0 border border-white/5 mb-6 shrink-0">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB: Content */}
            <TabsContent
              value="overview"
              className="mt-0 flex-1 overflow-y-auto custom-scrollbar pb-10"
            >
              <div className="flex flex-col gap-6">
                <BatchProgress data={batchData} />
                <SectionModules
                  modules={modules}
                  lastVisitedId={lastVisitedId}
                />
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
          <BatchProgress data={batchData} />
          <SectionModules modules={modules} lastVisitedId={lastVisitedId} />
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
