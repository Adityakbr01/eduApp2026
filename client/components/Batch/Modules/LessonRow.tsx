"use client";

import { Button } from "@/components/ui/button";
import type { Lesson } from "@/services/classroom/batch-types";
import StatusIcon from "./StatusIcon";

interface LessonRowProps {
  item: Lesson;
  isLastVisited?: boolean;
  onClick: (item: Lesson) => void;
}

const LessonRow = ({ item, isLastVisited, onClick }: LessonRowProps) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !item.isLocked && onClick(item)}
      className={`flex items-start gap-3 group ${
        item.isLocked ? "cursor-not-allowed! opacity-70" : "cursor-pointer"
      }`}
    >
      {/* Status Icon */}
      <div className="shrink-0 mt-[5px]">
        <StatusIcon completed={item.completed} isLocked={item.isLocked} />
      </div>

      {/* Title + Meta */}
      <div className="flex-1 min-w-0">
        <p className="text-lg text-white truncate leading-snug">{item.title}</p>

        {item.overdue && (
          <p className="font-HelveticaNow text-[13px] text-red-600 mt-0.5">
            {item.completed ? "Late Submission" : "Overdue"}: {item.daysLate}{" "}
            days late · {item.penalty}% Penalty
          </p>
        )}

        {!item.isLocked && item.deadline && !item.overdue && (
          <p className="font-HelveticaNow text-[13px] text-white/60 mt-0.5">
            Deadline: {item.deadline}
          </p>
        )}

        {item.isLocked && item.start && (
          <p className="font-HelveticaNow text-[13px] text-white/45 mt-0.5">
            Start: {item.start}
          </p>
        )}
      </div>

      {/* Right side: Marks + Resume */}
      <div className="flex items-center gap-3 shrink-0 self-center ml-auto">
        {item.marks > 0 && (
          <span
            className={`font-HelveticaNow text-sm tabular-nums min-w-12 text-right ${
              item.obtainedMarks >= item.marks
                ? "text-emerald-400"
                : item.obtainedMarks > 0
                  ? "text-white/60"
                  : "text-white/40"
            }`}
          >
            {item.obtainedMarks}/{item.marks}
          </span>
        )}

        {isLastVisited && !item.isLocked && (
          <Button
            type="button"
            className="cursor-pointer btn btn-primary md:hover:scale-105 transition-all text-xs px-3 py-1.5 h-auto font-normal shrink-0 shadow-doubt"
            onClick={(e) => {
              e.stopPropagation();
              onClick(item);
            }}
          >
            {item.completed ? "Review" : "Resume"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LessonRow;
