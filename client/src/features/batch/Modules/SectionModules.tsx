"use client";

import type { Lesson, Module } from "@/services/classroom/batch-types";
import { AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LiveClassBanner from "./LiveClassBanner";
import SectionAccordion from "./SectionAccordion";

interface SectionModulesProps {
  modules: Module[];
  lastVisitedId?: string;
  onContentSelect?: (contentId: string) => void;
  activeContentId?: string;
}

const SectionModules = ({
  modules,
  lastVisitedId,
  onContentSelect,
  activeContentId,
}: SectionModulesProps) => {
  const router = useRouter();
  const params = useParams();
  const batchId = params?.batchId as string;

  const [activeTab, setActiveTab] = useState<"modules" | "announcements">(
    "modules",
  );
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Auto-expand section containing lastVisitedId
  useEffect(() => {
    if (modules.length === 0) return;

    let targetSectionId = modules[0].id;

    if (lastVisitedId) {
      for (const module of modules) {
        const hasLesson = module.lessons.some((l) => l.id === lastVisitedId);
        if (hasLesson) {
          targetSectionId = module.id;
          break;
        }
      }
    }

    setExpandedSections([targetSectionId]);
  }, [modules, lastVisitedId]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleItemClick = (item: Lesson) => {
    if (item.isLocked) return;
    if (onContentSelect) {
      onContentSelect(item.id);
    } else {
      let url = `/classroom/batch/${batchId}/lessons/${item.id}`;
      if (lastVisitedId) {
        url += `?lastVisitedId=${lastVisitedId}`;
      }
      router.push(url);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-dark-card border border-white/5 rounded-2xl overflow-hidden relative text-white/80">
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
              <SectionAccordion
                key={module.id}
                section={module}
                isExpanded={expandedSections.includes(module.id)}
                onToggle={() => toggleSection(module.id)}
                onItemClick={handleItemClick}
                lastVisitedId={lastVisitedId}
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

export default SectionModules;
