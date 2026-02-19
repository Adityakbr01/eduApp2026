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
import { CheckCircle, Play } from "lucide-react";

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

interface MobileLayoutProps {
  batchId: string;
  activeContentId: string | null;
  activeContentMeta: LessonRes | null;
  contentDetail: ContentDetailResponse | undefined;
  isContentLoading: boolean;
}

const MobileLayout = ({
  batchId,
  activeContentId,
  activeContentMeta,
  contentDetail,
  isContentLoading,
}: MobileLayoutProps) => {
  return (
    <div className="flex-col-reverse md:hidden gap-3 flex-1 overflow-auto">
      {/* Content Player Mobile */}
      <div className="bg-dark-card rounded-2xl flex flex-col w-full border border-white/5 text-white/80 flex-1 min-h-[250px]">
        <div className="flex items-center gap-2 w-full shadow-md shadow-black/5 h-14 shrink-0 px-4 text-lg text-white/80 bg-dark-extra-light justify-between rounded-t-2xl">
          <div className="flex items-center gap-2 text-lg">
            <Play size={18} className="text-accent" />
            <span className="text-white/80">
              {activeContentMeta
                ? getContentTypeLabel(activeContentMeta.type)
                : "Content"}
            </span>
          </div>
          <div className="cursor-pointer btn btn-sm rounded-lg bg-doubt text-sm font-apfel btn-neutral outline-0 border-0 text-white font-normal">
            Doubt
          </div>
        </div>
        <div className="h-full w-full overflow-y-auto">
          {activeContentId && contentDetail ? (
            <>
              {contentDetail.contentType === "video" && (
                <div className="h-full w-full vdo-container min-h-[200px]">
                  <VdoCipherPlayer
                    batchId={batchId}
                    lessonContent={contentDetail}
                    lessonContentId={contentDetail.id}
                  />
                </div>
              )}
              {contentDetail.contentType === "quiz" &&
                contentDetail.assessment?.type === "quiz" && (
                  <div className="p-3">
                    <QuizPlayer
                      contentId={contentDetail.id}
                      courseId={batchId}
                      quizData={contentDetail.assessment.data as QuizData}
                      isCompleted={contentDetail.isCompleted}
                      obtainedMarks={contentDetail.obtainedMarks}
                    />
                  </div>
                )}
              {contentDetail.contentType === "assignment" &&
                contentDetail.assessment?.type === "assignment" && (
                  <div className="p-3">
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
              {contentDetail.contentType === "pdf" && contentDetail.pdfUrl && (
                <iframe
                  src={contentDetail.pdfUrl}
                  className="w-full h-[50vh] bg-white"
                  title="PDF Viewer"
                />
              )}
              {contentDetail.contentType === "audio" &&
                contentDetail.audioUrl && (
                  <div className="p-6 flex justify-center">
                    <audio
                      controls
                      src={contentDetail.audioUrl}
                      className="w-full"
                    />
                  </div>
                )}
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-black/50 rounded-b-2xl min-h-[200px]">
              <div className="text-center text-white/40">
                <Play size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-base">
                  {isContentLoading ? "Loading..." : "Select content to view"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Class Info */}
      <div className="bg-dark-card rounded-2xl flex flex-col w-full border border-white/5 text-white/80">
        <div className="flex items-center gap-2 w-full shadow-md shadow-black/5 h-14 shrink-0 px-4 text-lg text-white/80 bg-dark-extra-light rounded-t-2xl">
          <div className="flex items-center gap-3 text-lg">
            <div className="border-2 border-accent rounded-full p-0.5 w-5 h-5 flex items-center justify-center">
              <Play size={10} className="text-accent ms-0.5" strokeWidth={3} />
            </div>
            <span className="text-white/80">Class</span>
          </div>
        </div>
        <div className="px-5 py-4">
          <h1 className="text-xl font-apfel-mittel text-white">
            {contentDetail?.title ||
              activeContentMeta?.title ||
              "Select content"}
          </h1>
          {contentDetail && (
            <div className="flex text-sm py-2 gap-2 text-white/60 items-center">
              {contentDetail.isCompleted ? (
                <>
                  Completed <CheckCircle size={16} className="text-green-500" />
                </>
              ) : (
                <span className="text-white/40">In Progress</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;
