"use client";

import { cn } from "@/lib/utils";
import useLessonStats from "./useLessonStats";

// ─── Progress Card ───
const ProgressCard = ({
  stats,
  variant = "desktop",
  collapsed = false,
}: {
  stats: ReturnType<typeof useLessonStats>;
  variant?: "desktop" | "mobile";
  collapsed?: boolean;
}) => {
  if (!stats) return null;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 transition-all duration-500 p-4 ease-in-out border-2 rounded-lg border-dark-extra-light",
        collapsed && "rounded-b-lg border-t-0",
        variant === "mobile" && "text-white",
      )}
    >
      <div
        className="whitespace-nowrap"
        data-tip="Progress"
        data-tip-dir="right"
      >
        {variant === "mobile" ? (
          <>
            <span className="text-xl text-gray-300">
              Progress {stats.completionPercentage.toFixed(1)}
            </span>
            %
          </>
        ) : (
          <>
            <span className="md:text-xl text-[0.7rem]">
              {stats.completionPercentage.toFixed(1)}
            </span>
            %{" "}
            <span
              className={`transition-all duration-500 ease-in-out ${
                collapsed ? "hidden" : ""
              }`}
            >
              Complete
            </span>
          </>
        )}
      </div>
      <progress
        className={cn(
          "progress progress-accent w-full h-2",
          variant === "mobile" ? "bg-white/10" : "bg-white/20",
        )}
        value={stats.score.obtained}
        max={stats.score.total}
      />
      <div
        className={cn(
          "flex transition-all duration-500 ease-in-out w-full justify-evenly",
          variant === "desktop" && !collapsed && "h-14 pt-2",
          collapsed && "hidden",
        )}
      >
        {variant === "desktop" && (
          <>
            <div className="text-center">
              <div
                className="text-white/50"
                data-tip-dir="right"
                data-tip="Video"
              >
                Video
              </div>
              <div
                className="font-mono text-sm"
                data-tip-dir="right"
                data-tip="Video"
              >
                {stats.videos.done}/{stats.videos.total}
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-white/50"
                data-tip-dir="right"
                data-tip="Problem"
              >
                Problem
              </div>
              <div
                className="font-mono text-sm"
                data-tip-dir="right"
                data-tip="Problem"
              >
                {stats.problems.done}/{stats.problems.total}
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-white/50"
                data-tip-dir="right"
                data-tip="MCQs"
              >
                MCQs
              </div>
              <div
                className="font-mono text-sm"
                data-tip-dir="right"
                data-tip="MCQs"
              >
                {stats.quizzes.done}/{stats.quizzes.total}
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-white/50"
                data-tip-dir="right"
                data-tip="Score"
              >
                Score
              </div>
              <div
                className="font-mono text-sm"
                data-tip-dir="right"
                data-tip="Score"
              >
                {stats.score.obtained}/{stats.score.total}
              </div>
            </div>
          </>
        )}
        {variant === "mobile" && (
          <>
            <div className="text-center">
              <div className="font-mono text-sm">
                {stats.videos.done}/{stats.videos.total}
              </div>
            </div>
            <div className="text-center">
              <div className="font-mono text-sm">
                {stats.problems.done}/{stats.problems.total}
              </div>
            </div>
            <div className="text-center">
              <div className="font-mono text-sm">
                {stats.quizzes.done}/{stats.quizzes.total}
              </div>
            </div>
            <div className="text-center">
              <div className="font-mono text-sm">
                {stats.score.obtained}/{stats.score.total}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressCard;
