"use client";

import {
  useGetLessonDetail,
  useGetContentDetail,
} from "@/services/classroom/batch-queries";
import LessonSidebar from "@/components/Batch/Contents/LessonSidebar";
import VideoPlayer from "@/components/Batch/Contents/VideoPlayer";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LessonRes,
  QuizData,
  AssignmentData,
} from "@/services/classroom/batch-types";
import QuizPlayer from "@/components/Batch/Contents/QuizPlayer";
import AssignmentPlayer from "@/components/Batch/Contents/AssignmentPlayer";
import LessonDetailFooter from "@/components/Batch/Contents/LessonDetailFooter";

interface LessonDetailPageProps {
  batchId: string;
  lessonId: string;
}

function LessonDetailPage({ batchId, lessonId }: LessonDetailPageProps) {
  const { data, isLoading } = useGetLessonDetail(batchId, lessonId);
  const searchParams = useSearchParams();
  const lastVisitedId = searchParams.get("lastVisitedId");
  const lesson = data?.data;

  const [activeContentId, setActiveContentId] = useState<string | null>(null);
  const [activeContentMeta, setActiveContentMeta] = useState<LessonRes | null>(
    null,
  );

  // Fetch full content details when activeContentId changes
  const {
    data: contentDetailData,
    isLoading: isContentLoading,
    isError: isContentError,
  } = useGetContentDetail(batchId, activeContentId || "");

  const activeContentDetail = contentDetailData?.data;

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
    console.log("Selected content:", content.id);
    setActiveContentId(content.id);
    setActiveContentMeta(content);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-[#171717] items-center justify-center text-white/50">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#171717] text-white overflow-hidden">
      {/* LEFT SIDEBAR */}
      <LessonSidebar
        lesson={lesson}
        batchId={batchId}
        lastVisitedId={lastVisitedId || undefined}
        activeContentId={activeContentId || undefined}
        onContentSelect={handleContentSelect}
      />

      {/* CENTER - Untouched */}
      {/* CENTER - Content Details */}
      <div className="flex-1 bg-black/40 border-l border-white/5 flex flex-col overflow-y-auto custom-scrollbar">
        {activeContentDetail ? (
          <div className="p-6 flex flex-col gap-6">
            {/* Meta Header */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold uppercase tracking-wider text-white/70">
                  {activeContentDetail.contentType}
                </span>
                {activeContentDetail.level && (
                  <span className="px-2 py-1 rounded bg-primary/10 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {activeContentDetail.level}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold leading-snug">
                {activeContentDetail.title}
              </h2>
            </div>

            {/* Description */}
            {activeContentDetail.description && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
                  Description
                </h3>
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                  {activeContentDetail.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {activeContentDetail.tags &&
              activeContentDetail.tags.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeContentDetail.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full border border-white/10 text-xs text-white/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Related Links */}
            {activeContentDetail.relatedLinks &&
              activeContentDetail.relatedLinks.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
                    Related Links
                  </h3>
                  <div className="flex flex-col gap-2">
                    {activeContentDetail.relatedLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline truncate"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {link.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
          </div>
        ) : (
          <div className="p-6 text-center text-white/30 text-sm mt-10">
            {activeContentId
              ? "Loading details..."
              : "Select content to view details"}
          </div>
        )}
      </div>
      {/* Right - Content Player */}
      <div className="right flex-1 bg-black/20 flex flex-col relative overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-5xl mx-auto w-full">
            {activeContentId ? (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {activeContentMeta?.title || "Loading..."}
                  </h1>
                </div>

                {isContentLoading ? (
                  <div className="aspect-video w-full bg-white/5 animate-pulse rounded-xl flex items-center justify-center text-white/30">
                    Loading content...
                  </div>
                ) : activeContentDetail ? (
                  <>
                    {activeContentDetail.contentType === "video" &&
                      activeContentDetail.videoUrl && (
                        <VideoPlayer
                          src={activeContentDetail.videoUrl}
                          contentId={activeContentDetail.id}
                          courseId={batchId}
                          resumeAt={activeContentDetail.resumeAt}
                          minWatchPercent={
                            activeContentDetail.minWatchPercent || 90
                          }
                          marks={activeContentDetail.marks}
                          obtainedMarks={activeContentDetail.obtainedMarks}
                          isCompleted={activeContentDetail.isCompleted}
                        />
                      )}

                    {activeContentDetail.contentType === "pdf" &&
                      activeContentDetail.pdfUrl && (
                        <div className="flex flex-col gap-4 h-full">
                          <iframe
                            src={activeContentDetail.pdfUrl}
                            className="w-full h-[80vh] rounded-xl border border-white/10 bg-white"
                            title="PDF Viewer"
                          />
                          <div className="flex justify-end">
                            <a
                              href={activeContentDetail.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                              Open in New Tab
                            </a>
                          </div>
                        </div>
                      )}

                    {activeContentDetail.contentType === "audio" &&
                      activeContentDetail.audioUrl && (
                        <div className="flex flex-col items-center justify-center p-20 border border-white/10 rounded-2xl bg-white/5 gap-6">
                          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9 18V5l12-2v13" />
                              <circle cx="6" cy="18" r="3" />
                              <circle cx="18" cy="16" r="3" />
                            </svg>
                          </div>
                          <audio
                            controls
                            src={activeContentDetail.audioUrl}
                            className="w-full max-w-md"
                          />
                        </div>
                      )}

                    {activeContentDetail.contentType === "quiz" &&
                      activeContentDetail.assessment?.type === "quiz" && (
                        <QuizPlayer
                          contentId={activeContentDetail.id}
                          courseId={batchId}
                          quizData={
                            activeContentDetail.assessment.data as QuizData
                          }
                          isCompleted={activeContentDetail.isCompleted}
                          obtainedMarks={activeContentDetail.obtainedMarks}
                        />
                      )}

                    {activeContentDetail.contentType === "assignment" &&
                      activeContentDetail.assessment?.type === "assignment" && (
                        <AssignmentPlayer
                          contentId={activeContentDetail.id}
                          courseId={batchId}
                          assignmentData={
                            activeContentDetail.assessment
                              .data as AssignmentData
                          }
                          isCompleted={activeContentDetail.isCompleted}
                          obtainedMarks={activeContentDetail.obtainedMarks}
                        />
                      )}

                    {!["video", "pdf", "audio", "quiz", "assignment"].includes(
                      activeContentDetail.contentType,
                    ) && (
                      <div className="flex items-center justify-center p-20 border border-white/10 rounded-2xl bg-white/5 text-white/50">
                        Content type {activeContentDetail.contentType} player
                        not implemented yet.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-10 text-center text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
                    Failed to load content. Please try again.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-white/50">
                Select a content to view
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        {lesson?.contents &&
          activeContentId &&
          (() => {
            const currentIndex = lesson.contents.findIndex(
              (c) => c.id === activeContentId,
            );

            if (currentIndex === -1) return null;

            const totalLessons = lesson.contents.length;
            const hasPrevious = currentIndex > 0;
            const hasNext = currentIndex < totalLessons - 1;

            return (
              <LessonDetailFooter
                currentIndex={currentIndex + 1}
                totalLessons={totalLessons}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onPrevious={() => {
                  if (hasPrevious) {
                    handleContentSelect(lesson.contents[currentIndex - 1]);
                  }
                }}
                onNext={() => {
                  if (hasNext) {
                    handleContentSelect(lesson.contents[currentIndex + 1]);
                  }
                }}
              />
            );
          })()}
      </div>
    </div>
  );
}

export default LessonDetailPage;
