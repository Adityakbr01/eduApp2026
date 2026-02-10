"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import type { Module, ModuleItem } from "@/services/classroom/batch-types";
import LiveClassBanner from "./Modules/LiveClassBanner";
import ModuleAccordion from "./Modules/ModuleAccordion";

interface BatchModulesProps {
  modules: Module[];
  lastVisitedContentId?: string;
}

const BatchModules = ({ modules, lastVisitedContentId }: BatchModulesProps) => {
  const router = useRouter();
  const params = useParams();
  const batchId = params?.batchId as string;

  const [activeTab, setActiveTab] = useState<"modules" | "announcements">(
    "modules",
  );
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [expandedLessons, setExpandedLessons] = useState<string[]>([]);

  // Auto-expand module/lesson containing lastVisitedContentId
  useEffect(() => {
    if (modules.length === 0) return;

    let targetModuleId = modules[0].id;
    let targetLessonId =
      modules[0].lessons.length > 0 ? modules[0].lessons[0].id : null;

    if (lastVisitedContentId) {
      for (const module of modules) {
        for (const lesson of module.lessons) {
          const hasContent = lesson.items.some(
            (item) => item.id === lastVisitedContentId,
          );
          if (hasContent) {
            targetModuleId = module.id;
            targetLessonId = lesson.id;
            break;
          }
        }
        if (targetLessonId && targetModuleId !== modules[0].id) break;
      }
    }

    setExpandedModules([targetModuleId]);
    if (targetLessonId) {
      setExpandedLessons([targetLessonId]);
    }
  }, [modules, lastVisitedContentId]);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const toggleLesson = (id: string) => {
    setExpandedLessons((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  const handleItemClick = (item: ModuleItem) => {
    if (item.type === "locked") return;
    router.push(`/classroom/batch/${batchId}/content/${item.id}`);
  };

  return (
    <div className="flex flex-col w-full h-full bg-dark-card border border-white/5 rounded-2xl overflow-hidden relative">
      {/* Tabs Header */}
      <div className="flex items-center md:justify-start justify-center gap-1 md:gap-3 border-b border-white/5 bg-dark-extra-light px-2 sm:px-6 h-14 sm:h-16 shrink-0">
        <button
          onClick={() => setActiveTab("modules")}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === "modules"
              ? "text-primary bg-primary/10"
              : "text-white/50 hover:text-white hover:bg-white/5"
          }`}
        >
          <svg
            width="14"
            height="16"
            viewBox="0 0 15 18"
            fill="none"
            className="stroke-current shrink-0"
          >
            <path
              d="M7.4735 8.9059L14.1289 4.80067M7.4735 8.9059L0.828125 4.80067M7.4735 8.9059V16.3895M14.1289 4.80067L7.4735 1.29688L0.828125 4.80067M14.1289 4.80067L14.1289 12.5389L7.4735 16.3895M0.828125 4.80067V12.5389L7.4735 16.3895"
              strokeWidth="1.5"
            />
          </svg>
          <span>All Modules</span>
        </button>

        <button
          onClick={() => setActiveTab("announcements")}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === "announcements"
              ? "text-primary bg-primary/10"
              : "text-white/50 hover:text-white hover:bg-white/5"
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Announcements</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === "modules" && (
          <div className="flex flex-col pb-20">
            <LiveClassBanner />

            {modules.map((module) => (
              <ModuleAccordion
                key={module.id}
                module={module}
                isExpanded={expandedModules.includes(module.id)}
                onToggle={() => toggleModule(module.id)}
                expandedLessons={expandedLessons}
                onToggleLesson={toggleLesson}
                onItemClick={handleItemClick}
                lastVisitedContentId={lastVisitedContentId}
              />
            ))}
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="flex flex-col items-center justify-center h-48 text-white/30 text-sm">
            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
            No new announcements
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchModules;
