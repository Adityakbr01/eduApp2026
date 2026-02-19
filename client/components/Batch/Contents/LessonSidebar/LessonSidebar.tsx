"use client";

import {
  LessonDetailResponse,
  LessonRes,
} from "@/services/classroom/batch-types";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ContentList from "./ContentList";
import ProgressCard from "./ProgressCard";
import useLessonStats from "./useLessonStats";

// ─── SVG Icons ───

const GoBackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8.00002 14.3802H12.92C14.62 14.3802 16 13.0002 16 11.3002C16 9.6002 14.62 8.22021 12.92 8.22021H6.15002M7.57 9.7701L6 8.19012L7.57 6.62012M8 21H14C19 21 21 19 21 14V8C21 3 19 1 14 1H8C3 1 1 3 1 8V14C1 19 3 21 8 21Z" />
  </svg>
);

// ─── Sidebar Props ───
interface LessonSidebarProps {
  lesson: LessonDetailResponse | undefined;
  batchId: string;
  lastVisitedId?: string;
  activeContentId?: string;
  onContentSelect?: (content: LessonRes) => void;
}

// ─── Main LessonSidebar Component ───
const LessonSidebar = ({
  lesson,
  batchId,
  activeContentId,
  onContentSelect,
}: LessonSidebarProps) => {
  const router = useRouter();
  const stats = useLessonStats(lesson);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleBack = () => {
    router.push(`/classroom/batch/${batchId}?stay=true`);
  };

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <div
        className={`hidden md:flex flex-col h-full shrink-0 transition-all duration-500 ease-in-out ${
          collapsed ? "w-20" : "w-110"
        }`}
      >
        {/* Go Back Bar */}
        <div
          onClick={handleBack}
          className="bg-dark-card rounded-2xl flex flex-row mb-3 text-white items-center transition-all duration-500 ease-out justify-between w-full h-20 border border-white/5 cursor-pointer"
        >
          <span
            className={`text-xl text-nowrap transition-all duration-500 ease-in-out overflow-hidden ps-4 ${
              collapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[200px]"
            }`}
          >
            Go Back
          </span>
          <span className="cursor-pointer transition-all duration-500 pe-4 text-white/80">
            <GoBackIcon />
          </span>
        </div>

        {/* Sidebar Content Card */}
        <div className="bg-dark-card rounded-2xl flex flex-col transition-all h-full overflow-hidden pb-5 duration-500 ease-in-out flex-1 w-full border border-white/5 text-white/80">
          {/* Title Bar */}
          <div className="flex items-center gap-2 pe-12 w-full shadow-md shadow-black/5 h-16 shrink-0 px-6 text-xl text-white/80 bg-dark-extra-light p-5 sticky top-0 justify-center">
            <div
              className={`transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
            >
              <ChevronLeft
                size={24}
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapsed(!collapsed);
                }}
                className="text-white/70 bg-dark-light/15 border border-dark-light/40 rounded hover:brightness-125 p-0.5 cursor-pointer"
              />
            </div>
            <div
              className={`line-clamp-1 transition-all duration-500 ease-in-out overflow-hidden ${
                collapsed ? "opacity-0" : "opacity-100"
              }`}
            >
              {lesson?.title || "Loading..."}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto h-max">
            {/* Progress Section */}
            <div
              className={`transition-all pb-2 duration-500 ease-in-out shrink-0 ${
                collapsed ? "p-0 pb-2" : "p-4"
              }`}
            >
              <ProgressCard
                stats={stats}
                variant="desktop"
                collapsed={collapsed}
              />
            </div>

            {/* Lesson List */}
            <div className="px-2 pb-5">
              <div className="text-white/40 h-full">
                {lesson?.contents && (
                  <ContentList
                    contents={lesson.contents}
                    activeContentId={activeContentId}
                    onContentSelect={onContentSelect}
                    variant="desktop"
                    collapsed={collapsed}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MOBILE TOP BAR ─── */}
      <div className="flex md:hidden gap-2 justify-between mb-2 text-sm text-gray-400">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 border-white/5 bg-dark-extra-light aspect-square rounded-xl flex items-center justify-center border"
        >
          <ChevronRight size={16} />
        </button>
        <div className="w-full border-white/5 bg-dark-extra-light border py-3 flex items-center gap-2 px-3 rounded-xl">
          {stats ? `${stats.completionPercentage.toFixed(1)}%` : "..."}{" "}
          <progress
            value={stats?.score.obtained || 0}
            max={stats?.score.total || 1}
            className="w-full progress progress-accent bg-doubt"
          />
        </div>
      </div>

      {/* ─── MOBILE SIDEBAR OVERLAY ─── */}
      <div
        className="fixed inset-0 transition-transform h-screen w-full backdrop-blur-[2px] bg-black/70 z-100 md:hidden"
        style={{
          transform: mobileSidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
        onClick={() => setMobileSidebarOpen(false)}
      >
        <div
          className="h-full w-[80%] pt-10 text-white bg-dark-card"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleBack}
            className="items-center gap-1 text-xl px-5 mb-5 flex"
          >
            <ChevronLeft size={20} /> Go Back
          </button>
          <div className="flex justify-between items-center px-5 pb-3 border-b-[0.5px] border-white/4">
            <h1 className="tracking-wide text-xl line-clamp-1">
              {lesson?.title || "Loading..."}
            </h1>
            <X
              size={18}
              className="cursor-pointer shrink-0"
              onClick={() => setMobileSidebarOpen(false)}
            />
          </div>
          <div className="flex-1 max-h-[calc(100dvh-100px)] overflow-y-auto pb-5">
            {/* Progress */}
            <div className="transition-all duration-500 ease-in-out overflow-hidden p-4 shrink-0">
              <ProgressCard stats={stats} variant="mobile" />
            </div>

            {/* Lesson list mobile */}
            <div className="px-2 relative h-max pr-2">
              <div className="text-dark-light">
                {lesson?.contents && (
                  <ContentList
                    contents={lesson.contents}
                    activeContentId={activeContentId}
                    onContentSelect={(content) => {
                      onContentSelect?.(content);
                      setMobileSidebarOpen(false);
                    }}
                    variant="mobile"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonSidebar;
