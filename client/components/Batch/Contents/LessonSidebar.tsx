"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  PlayCircle,
  FileText,
  HelpCircle,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LessonDetailResponse,
  LessonRes,
} from "@/services/classroom/batch-types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface LessonSidebarProps {
  lesson: LessonDetailResponse | undefined;
  batchId: string;
  lastVisitedId?: string;
  activeContentId?: string;
  onContentSelect?: (content: LessonRes) => void;
}

const LessonSidebar = ({
  lesson,
  batchId,
  lastVisitedId: propLastVisitedId,
  activeContentId,
  onContentSelect,
}: LessonSidebarProps) => {
  const router = useRouter();

  const targetId =
    activeContentId || propLastVisitedId || lesson?.lastVisitedId;

  // Calculate stats
  const stats = useMemo(() => {
    if (!lesson?.contents) return null;

    const contents = lesson.contents;
    const total = contents.length;
    const completed = contents.filter((c) => c.isCompleted).length;
    const completionPercentage = total > 0 ? (completed / total) * 100 : 0;

    const videos = contents.filter((c) => c.type === "video").length;
    const problems = contents.filter((c) => c.type === "assignment").length;
    const quizzes = contents.filter((c) => c.type === "quiz").length;

    const totalMarks = contents.reduce(
      (acc, curr) => acc + (curr.marks || 0),
      0,
    );
    const obtainedMarks = contents.reduce(
      (acc, curr) => acc + (curr.obtainedMarks || 0),
      0,
    );

    return {
      completionPercentage,
      videos,
      problems,
      quizzes,
      score: { obtained: obtainedMarks, total: totalMarks },
    };
  }, [lesson]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(`/classroom/batch/${batchId}`);
    }
  };

  // Check if last visited content exists in the current lesson to auto-expand
  const defaultOpen = useMemo(() => {
    if (!targetId || !lesson?.contents) return "contents";
    const exists = lesson.contents.some((c) => c.id === targetId);
    return exists ? "contents" : "";
  }, [lesson, targetId]);

  return (
    <div className="w-[400px] shrink-0 flex flex-col border-r border-white/5 bg-dark-card h-full">
      {/* Header / Back Button */}
      <div className="p-4 border-b border-white/5">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
        {/* Title Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary text-xs font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" />
            Lesson Detail
          </div>
          <h1 className="text-xl font-bold leading-tight">
            {lesson?.title || "Loading Lesson..."}
          </h1>
        </div>

        {/* Progress Card */}
        {stats && (
          <div className="rounded-xl bg-white/5 border border-white/5 p-5 flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-3xl font-bold font-mono">
                  {stats.completionPercentage.toFixed(1)}
                  <span className="text-base text-white/40">%</span>
                </span>
                <span className="text-xs text-white/40 font-medium uppercase tracking-wider">
                  Completion
                </span>
              </div>
              <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center">
                <Trophy className="w-4 h-4 text-primary" />
              </div>
            </div>

            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5">
              {[
                { label: "Video", val: `${stats.videos}/${stats.videos}` }, // showing total for now
                { label: "Problem", val: `${stats.problems}` },
                { label: "Quiz", val: `${stats.quizzes}` },
                {
                  label: "Score",
                  val: `${stats.score.obtained}/${stats.score.total}`,
                },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <span className="font-mono text-sm font-medium">
                    {stat.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lesson Contents List - Collapsible */}
        <Accordion
          key={defaultOpen}
          type="single"
          collapsible
          defaultValue={defaultOpen}
          className="w-full"
        >
          <AccordionItem value="contents" className="border-none">
            <AccordionTrigger className="text-sm font-medium text-white/50 px-1 hover:no-underline hover:text-white py-2">
              Lesson Contents
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 pt-2">
                {lesson?.contents?.map((content: LessonRes) => {
                  const itemsMatch = targetId === content.id;
                  return (
                    <div
                      key={content.id}
                      onClick={() => onContentSelect?.(content)}
                      className={cn(
                        "group flex flex-col gap-2 p-3 rounded-xl border transition-all cursor-pointer",
                        itemsMatch
                          ? "bg-primary/10 border-primary/20"
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors",
                            itemsMatch
                              ? "bg-primary/20 text-primary"
                              : "bg-white/5 text-white/50 group-hover:text-primary group-hover:bg-primary/10",
                          )}
                        >
                          {content.type === "video" && (
                            <PlayCircle className="w-4 h-4" />
                          )}
                          {content.type === "pdf" && (
                            <FileText className="w-4 h-4" />
                          )}
                          {content.type === "quiz" && (
                            <HelpCircle className="w-4 h-4" />
                          )}
                          {content.type === "assignment" && (
                            <FileText className="w-4 h-4" />
                          )}
                          {!["video", "pdf", "quiz", "assignment"].includes(
                            content.type,
                          ) && <FileText className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className={cn(
                              "text-sm font-medium truncate transition-colors",
                              itemsMatch
                                ? "text-primary"
                                : "text-white/90 group-hover:text-primary",
                            )}
                          >
                            {content.title}
                          </h4>
                          <p className="text-xs text-white/40 mt-0.5 capitalize flex items-center gap-1.5">
                            <span>{content.type}</span>
                            {content.marks > 0 && (
                              <>
                                <span className="w-0.5 h-0.5 rounded-full bg-white/20" />
                                <span>{content.marks} Marks</span>
                              </>
                            )}
                          </p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          {content.isCompleted ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-3 h-3"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-white/10 group-hover:border-white/20" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default LessonSidebar;
