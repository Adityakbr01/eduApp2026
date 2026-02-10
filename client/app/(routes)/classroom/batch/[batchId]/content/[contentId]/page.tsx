"use client";

import AssessmentCard from "@/components/Batch/Contents/AssessmentCard";
import AudioPlayer from "@/components/Batch/Contents/AudioPlayer";
import ManualCompleteButton from "@/components/Batch/Contents/ManualCompleteButton";
import PdfViewer from "@/components/Batch/Contents/PdfViewer";
import TextContent from "@/components/Batch/Contents/TextContent";
import VideoPlayer from "@/components/Batch/Contents/VideoPlayer";
import QuizPlayer from "@/components/Batch/Contents/QuizPlayer";
import AssignmentPlayer from "@/components/Batch/Contents/AssignmentPlayer";
import { useGetContentDetail } from "@/services/classroom/batch-queries";
import { AlertCircle, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

// ==================== CONTENT PLAYER PAGE ====================

export default function ContentPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params?.batchId as string;
  const contentId = params?.contentId as string;

  // We need courseId — in the URL it's batchId (which is actually courseId)
  const courseId = batchId;

  const { data, isLoading, isError, error } = useGetContentDetail(
    courseId,
    contentId,
  );
  const content = data?.data;

  const goBack = () => router.push(`/classroom/batch/${batchId}`);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-white/60 text-center max-w-md">
          {(error as any)?.response?.data?.message ||
            "Content not found or locked"}
        </p>
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Batch
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-dark">
      {/* Top Bar */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-dark-card shrink-0">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-white truncate">
            {content.title}
          </h1>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-white/40 capitalize">
              {content.contentType}
            </span>
            {content.marks > 0 && (
              <span className="text-xs text-white/40">
                {content.obtainedMarks}/{content.marks} marks
              </span>
            )}
            {content.isCompleted && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle className="w-3 h-3" />
                Completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {content.contentType === "video" && content.videoUrl && (
          <VideoPlayer
            src={content.videoUrl}
            contentId={content.id}
            courseId={courseId}
            resumeAt={content.resumeAt}
            minWatchPercent={content.minWatchPercent || 80}
            marks={content.marks}
            obtainedMarks={content.obtainedMarks}
            isCompleted={content.isCompleted}
          />
        )}

        {content.contentType === "pdf" && content.pdfUrl && (
          <PdfViewer
            src={content.pdfUrl}
            contentId={content.id}
            marks={content.marks}
            isCompleted={content.isCompleted}
          />
        )}

        {content.contentType === "audio" && content.audioUrl && (
          <AudioPlayer
            src={content.audioUrl}
            contentId={content.id}
            marks={content.marks}
            isCompleted={content.isCompleted}
          />
        )}

        {(content.contentType === "quiz" ||
          content.assessment?.type === "quiz") && (
          <QuizPlayer content={content} courseId={courseId} />
        )}

        {(content.contentType === "assignment" ||
          content.assessment?.type === "assignment") && (
          <AssignmentPlayer content={content} courseId={courseId} />
        )}

        {content.contentType === "text" && <TextContent content={content} />}

        {/* Manual Mark Complete Button - hidden for quiz/assignment (they auto-complete) */}
        {!content.isCompleted &&
          content.contentType !== "quiz" &&
          content.contentType !== "assignment" &&
          content.assessment?.type !== "quiz" &&
          content.assessment?.type !== "assignment" && (
            <ManualCompleteButton
              contentId={content.id}
              courseId={courseId}
              marks={content.marks}
            />
          )}
      </div>
    </div>
  );
}
