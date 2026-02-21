"use client";

import LessonDetailFooter from "@/features/batch/Contents/components/layouts/LessonDetailFooter";
import LessonSidebar from "@/features/batch/Contents/components/LessonSidebar/LessonSidebar";
import {
  useGetContentDetail,
  useGetLessonDetail,
} from "@/services/classroom/batch-queries";
import { LessonRes } from "@/services/classroom/batch-types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { useIsMobile } from "@/hooks/use-mobile";
import ClassInfoPanel from "../components/ClassInfoPanel";
import ContentPlayerPanel from "../components/ContentPlayerPanel";
import LessonDetailSkeleton from "../components/LessonDetailSkeleton";
import { useResizePanels } from "../hooks/useResizePanels";

// ─── Props ───
interface LessonDetailPageProps {
  batchId: string;
  lessonId: string;
}

function LessonDetailPage({ batchId, lessonId }: LessonDetailPageProps) {
  const isMobile = useIsMobile();
  const { data, isLoading } = useGetLessonDetail(batchId, lessonId);
  const searchParams = useSearchParams();
  const lastVisitedId = searchParams.get("lastVisitedId");
  const lesson = data?.data;

  const [activeContentId, setActiveContentId] = useState<string | null>(null);
  const [activeContentMeta, setActiveContentMeta] = useState<LessonRes | null>(
    null,
  );

  // ─── Resize Hook ───
  const { leftPanelRef, handleDoubleClick } = useResizePanels();

  // Fetch full content details when activeContentId changes
  const {
    data: contentDetailData,
    isLoading: isContentLoading,
    isError: isContentError,
  } = useGetContentDetail(batchId, activeContentId || "");

  const activeContentDetail = contentDetailData?.data;

  // ─── Quiz State ───
  const [quizState, setQuizState] = useState({
    currentIndex: 0,
    completed: false,
    obtainedMarks: 0,
  });

  // Sync Quiz State with active content when it loads
  useEffect(() => {
    if (activeContentDetail) {
      setQuizState({
        currentIndex: 0,
        completed: activeContentDetail.isCompleted || false,
        obtainedMarks: activeContentDetail.obtainedMarks || 0,
      });
    }
  }, [activeContentId, activeContentDetail]);

  // Initialize active content
  useEffect(() => {
    if (lesson?.contents && lesson.contents.length > 0 && !activeContentId) {
      // Priority 1: URL param
      if (lastVisitedId) {
        const target = lesson.contents.find((c) => c.id === lastVisitedId);
        if (target) {
          setActiveContentId(target.id);
          setActiveContentMeta(target);
          return;
        }
      }

      // Priority 2: Backend suggested lastVisitedId
      if (lesson.lastVisitedId) {
        const target = lesson.contents.find(
          (c) => c.id === lesson.lastVisitedId,
        );
        if (target) {
          setActiveContentId(target.id);
          setActiveContentMeta(target);
          return;
        }
      }

      // Priority 3: Default to first
      const first = lesson.contents[0];
      setActiveContentId(first.id);
      setActiveContentMeta(first);
    }
  }, [lesson, lastVisitedId, activeContentId]);

  const handleContentSelect = (content: LessonRes) => {
    setActiveContentId(content.id);
    setActiveContentMeta(content);
  };

  // Loading State
  if (isLoading) {
    return <LessonDetailSkeleton />;
  }

  // Footer data
  const currentIndex =
    lesson?.contents?.findIndex((c) => c.id === activeContentId) ?? -1;
  const totalLessons = lesson?.contents?.length ?? 0;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalLessons - 1;

  return (
    <main className="relative flex flex-col bg-black py-7 px-5 gap-5 font-apfel font-normal md:flex-row md:gap-3 h-[calc(100vh-60px)]">
      {/* ─── SIDEBAR (includes desktop + mobile) ─── */}
      <LessonSidebar
        lesson={lesson}
        batchId={batchId}
        lastVisitedId={lastVisitedId || undefined}
        activeContentId={activeContentId || undefined}
        onContentSelect={handleContentSelect}
      />

      {/* ─── Resizable Panels ─── */}
      <div className="flex flex-1 h-full overflow-hidden">
        <Group
          orientation={isMobile ? "vertical" : "horizontal"}
          id="lesson-panels"
        >
          {isMobile ? (
            <>
              {/* Mobile: Content Player on top */}
              <Panel
                defaultSize={60}
                minSize={20}
                id="content-player"
                className="relative"
              >
                <ContentPlayerPanel
                  batchId={batchId}
                  activeContentId={activeContentId}
                  activeContentMeta={activeContentMeta}
                  contentDetail={activeContentDetail}
                  isContentLoading={isContentLoading}
                  quizState={quizState}
                  setQuizState={setQuizState}
                />
              </Panel>

              {/* Mobile: Vertical resize handle */}
              <Separator className="flex items-center justify-center group h-3 hover:h-4 transition-all relative z-20">
                <div className="w-12 h-1 bg-white/10 rounded-full group-hover:bg-doubt group-hover:w-16 group-active:bg-doubt group-active:w-20 transition-all duration-150 cursor-row-resize" />
              </Separator>

              {/* Mobile: Class Info on bottom */}
              <Panel
                defaultSize={40}
                minSize={0}
                id="class-info"
                className="relative"
              >
                <ClassInfoPanel
                  contentDetail={activeContentDetail}
                  activeContentId={activeContentId}
                  quizState={quizState}
                />
              </Panel>
            </>
          ) : (
            <>
              {/* Desktop: Class Info on left */}
              <Panel
                panelRef={leftPanelRef}
                id="class-info"
                defaultSize={40}
                minSize={0}
                collapsible
                collapsedSize={0}
                className="relative"
              >
                <ClassInfoPanel
                  contentDetail={activeContentDetail}
                  activeContentId={activeContentId}
                  quizState={quizState}
                />
              </Panel>

              {/* Desktop: Horizontal resize handle */}
              <Separator className="flex items-center justify-center group w-3 hover:w-4 transition-all relative z-20">
                <div
                  onMouseDown={handleDoubleClick}
                  className="w-1 h-12 bg-white/10 rounded-full group-hover:bg-doubt group-hover:h-16 group-active:bg-doubt group-active:h-20 transition-all duration-150 cursor-col-resize"
                />
              </Separator>

              {/* Desktop: Content Player on right */}
              <Panel
                defaultSize={60}
                minSize={20}
                id="content-player"
                className="relative"
              >
                <ContentPlayerPanel
                  batchId={batchId}
                  activeContentId={activeContentId}
                  activeContentMeta={activeContentMeta}
                  contentDetail={activeContentDetail}
                  isContentLoading={isContentLoading}
                  quizState={quizState}
                  setQuizState={setQuizState}
                />
              </Panel>
            </>
          )}
        </Group>
      </div>

      {/* ─── BOTTOM NAVIGATION ─── */}
      {lesson?.contents && activeContentId && currentIndex !== -1 && (
        <LessonDetailFooter
          currentIndex={currentIndex + 1}
          totalLessons={totalLessons}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          onPrevious={() => {
            if (hasPrevious && lesson.contents) {
              handleContentSelect(lesson.contents[currentIndex - 1]);
            }
          }}
          onNext={() => {
            if (hasNext && lesson.contents) {
              handleContentSelect(lesson.contents[currentIndex + 1]);
            }
          }}
        />
      )}
    </main>
  );
}

export default LessonDetailPage;
