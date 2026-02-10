"use client";

import {
  CheckCircle,
  Lock,
  Play,
  FileText,
  HelpCircle,
  Headphones,
  ClipboardCheck,
  Type,
} from "lucide-react";
import type {
  ModuleItem,
  ItemContentType,
} from "@/services/classroom/batch-types";

interface ContentItemProps {
  item: ModuleItem;
  isLastVisited?: boolean;
  onClick: (item: ModuleItem) => void;
}

const contentTypeConfig: Record<
  ItemContentType,
  { icon: typeof Play; label: string; color: string }
> = {
  video: { icon: Play, label: "Video", color: "text-blue-400" },
  pdf: { icon: FileText, label: "PDF", color: "text-orange-400" },
  quiz: { icon: HelpCircle, label: "Quiz", color: "text-purple-400" },
  audio: { icon: Headphones, label: "Audio", color: "text-cyan-400" },
  assignment: {
    icon: ClipboardCheck,
    label: "Assignment",
    color: "text-yellow-400",
  },
  text: { icon: Type, label: "Text", color: "text-green-400" },
  locked: { icon: Lock, label: "Locked", color: "text-white/30" },
};

const ContentItem = ({ item, isLastVisited, onClick }: ContentItemProps) => {
  const config = contentTypeConfig[item.type] || contentTypeConfig.locked;
  const Icon = config.icon;
  const isLocked = item.type === "locked";
  const hasMarks = (item.marks ?? 0) > 0;

  return (
    <div
      onClick={() => onClick(item)}
      className={`flex items-start gap-3 px-4 py-3 rounded-lg transition-all relative ${
        isLocked
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-white/[0.03] cursor-pointer group"
      }`}
    >
      {/* Icon */}
      <div className="mt-0.5 shrink-0">
        {item.completed ? (
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        ) : isLocked ? (
          <Lock className="w-4.5 h-4.5 text-white/20" />
        ) : (
          <Icon className={`w-5 h-5 ${config.color}`} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-center gap-2">
          <h4 className="text-sm text-white/80 group-hover:text-white transition-colors line-clamp-1">
            {item.title}
          </h4>

          {/* Last visited tag */}
          {isLastVisited && !isLocked && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
              Continue
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {/* Type label */}
          {!isLocked && (
            <span className={`text-[11px] ${config.color} opacity-60`}>
              {config.label}
            </span>
          )}

          {/* Marks */}
          {hasMarks && !isLocked && (
            <>
              <span className="text-white/10">·</span>
              {item.completed ? (
                <span
                  className={`text-[11px] font-medium ${
                    item.penaltyApplied ? "text-amber-400" : "text-white/40"
                  }`}
                >
                  {item.obtainedMarks ?? 0}/{item.marks} marks
                </span>
              ) : (
                <span className="text-[11px] text-white/30">
                  {item.marks} marks
                </span>
              )}
            </>
          )}

          {/* Video status */}
          {item.videoStatus && item.videoStatus !== "READY" && (
            <>
              <span className="text-white/10">·</span>
              <span className="text-[11px] text-amber-400">
                {item.videoStatus}
              </span>
            </>
          )}
        </div>

        {/* Overdue text */}
        {item.overdue && (
          <p className="text-xs text-red-400 font-medium mt-1">
            Overdue: {item.daysLate} days late - {item.penalty}% Penalty
          </p>
        )}

        {/* Deadline */}
        {item.deadline && !item.overdue && (
          <p className="text-[11px] text-white/25 mt-0.5">
            Due: {item.deadline}
          </p>
        )}

        {/* Start date */}
        {item.start && (
          <p className="text-[11px] text-white/25 mt-0.5">
            Starts: {item.start}
          </p>
        )}
      </div>
    </div>
  );
};

export default ContentItem;
