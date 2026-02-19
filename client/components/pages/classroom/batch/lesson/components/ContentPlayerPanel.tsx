"use client";

import AssignmentPlayer from "@/components/Batch/Contents/AssignmentPlayer";
import QuizPlayer from "@/components/Batch/Contents/QuizPlayer";
import VdoCipherPlayer from "@/components/Batch/Contents/VdoCipherPlayer";
import {
  AssignmentData,
  ContentDetailResponse,
  LessonRes,
  QuizData,
} from "@/services/classroom/batch-types";
import { Play, Music } from "lucide-react";

// ─── Content type label helper ───
function getContentTypeLabel(type: string): string {
  switch (type) {
    case "video":
      return "Video Lecture";
    case "pdf":
      return "PDF Document";
    case "audio":
      return "Audio Lecture";
    case "quiz":
      return "Quiz";
    case "assignment":
      return "Assignment";
    default:
      return "Content";
  }
}

interface ContentPlayerPanelProps {
  batchId: string;
  activeContentId: string | null;
  activeContentMeta: LessonRes | null;
  contentDetail: ContentDetailResponse | undefined;
  isContentLoading: boolean;
}

const ContentPlayerPanel = ({
  batchId,
  activeContentId,
  activeContentMeta,
  contentDetail,
  isContentLoading,
}: ContentPlayerPanelProps) => {
  return (
    <div className="h-full w-full">
      <div className="bg-dark-card rounded-2xl flex flex-col h-full w-full border border-white/5 text-white/80 overflow-hidden">
        {/* Header — responsive height */}
        <div className="flex items-center w-full shadow-md shadow-black/5 shrink-0 px-3 sm:px-5 h-12 sm:h-14 text-base sm:text-xl text-white/80 bg-dark-extra-light justify-between">
          <div className="flex items-center gap-2 ml-1">
            <Play size={16} className="text-accent sm:w-5 sm:h-5" />
            <span className="text-white/80 truncate">
              {activeContentMeta
                ? getContentTypeLabel(activeContentMeta.type)
                : "Content"}
            </span>
          </div>
          <div className="cursor-pointer btn btn-sm sm:btn-md rounded-lg bg-doubt text-sm sm:text-base font-apfel btn-neutral outline-0 border-0 text-white px-2 sm:px-3 py-1 font-normal">
            Doubt
          </div>
        </div>

        {/* Content Player Area — fills remaining space */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden">
          {activeContentId ? (
            <div className="h-full w-full">
              {isContentLoading ? (
                <div className="flex items-center justify-center h-full w-full min-h-[200px]">
                  <div className="flex flex-col items-center gap-3 text-white/30">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
                    <span className="text-sm">Loading content...</span>
                  </div>
                </div>
              ) : contentDetail ? (
                <>
                  {/* ─── VIDEO ─── */}
                  {contentDetail.contentType === "video" && (
                    <div className="h-full w-full">
                      <VdoCipherPlayer
                        batchId={batchId}
                        lessonContent={contentDetail}
                        lessonContentId={contentDetail.id}
                      />
                    </div>
                  )}

                  {/* ─── PDF ─── */}
                  {contentDetail.contentType === "pdf" &&
                    contentDetail.pdfUrl && (
                      <div className="flex flex-col gap-3 h-full p-2 sm:p-4">
                        <iframe
                          src={contentDetail.pdfUrl}
                          className="w-full flex-1 min-h-[300px] rounded-lg sm:rounded-xl border border-white/10 bg-white"
                          title="PDF Viewer"
                        />
                        <div className="flex justify-end">
                          <a
                            href={contentDetail.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium"
                          >
                            Open in New Tab
                          </a>
                        </div>
                      </div>
                    )}

                  {/* ─── AUDIO ─── */}
                  {contentDetail.contentType === "audio" &&
                    contentDetail.audioUrl && (
                      <div className="flex flex-col items-center justify-center p-6 sm:p-12 md:p-20 border border-white/10 rounded-xl sm:rounded-2xl bg-white/5 gap-4 sm:gap-6 m-2 sm:m-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          <Music size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <audio
                          controls
                          src={contentDetail.audioUrl}
                          className="w-full max-w-md"
                        />
                      </div>
                    )}

                  {/* ─── QUIZ ─── */}
                  {contentDetail.contentType === "quiz" &&
                    contentDetail.assessment?.type === "quiz" && (
                      <div className="p-2 sm:p-4">
                        <QuizPlayer
                          contentId={contentDetail.id}
                          courseId={batchId}
                          quizData={contentDetail.assessment.data as QuizData}
                          isCompleted={contentDetail.isCompleted}
                          obtainedMarks={contentDetail.obtainedMarks}
                        />
                      </div>
                    )}

                  {/* ─── ASSIGNMENT ─── */}
                  {contentDetail.contentType === "assignment" &&
                    contentDetail.assessment?.type === "assignment" && (
                      <div className="p-2 sm:p-4">
                        <AssignmentPlayer
                          contentId={contentDetail.id}
                          courseId={batchId}
                          assignmentData={
                            contentDetail.assessment.data as AssignmentData
                          }
                          isCompleted={contentDetail.isCompleted}
                          obtainedMarks={contentDetail.obtainedMarks}
                        />
                      </div>
                    )}

                  {/* ─── UNSUPPORTED ─── */}
                  {!["video", "pdf", "audio", "quiz", "assignment"].includes(
                    contentDetail.contentType,
                  ) && (
                    <div className="flex items-center justify-center p-8 sm:p-20 border border-white/10 rounded-xl sm:rounded-2xl bg-white/5 text-white/50 m-2 sm:m-4 text-sm sm:text-base">
                      Content type &ldquo;{contentDetail.contentType}&rdquo;
                      player not implemented yet.
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 sm:p-10 text-center text-red-400 bg-red-500/10 rounded-lg sm:rounded-xl border border-red-500/20 m-2 sm:m-4 text-sm sm:text-base">
                  Failed to load content. Please try again.
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/40 min-h-[200px]">
              <div className="text-center">
                <Play
                  size={48}
                  className="mx-auto mb-3 opacity-30 sm:w-16 sm:h-16 sm:mb-4"
                />
                <p className="text-base sm:text-lg">Select content to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentPlayerPanel;
