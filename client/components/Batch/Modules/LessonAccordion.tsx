"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Lock, CheckCircle } from "lucide-react";
import type { Lesson, ModuleItem } from "@/services/classroom/batch-types";
import ContentItem from "./ContentItem";

interface LessonAccordionProps {
  lesson: Lesson;
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick: (item: ModuleItem) => void;
  lastVisitedContentId?: string;
}

const LessonAccordion = ({
  lesson,
  isExpanded,
  onToggle,
  onItemClick,
  lastVisitedContentId,
}: LessonAccordionProps) => {
  const completedCount = lesson.items.filter((i) => i.completed).length;
  const totalCount = lesson.items.length;

  return (
    <div className="flex flex-col">
      {/* Lesson Header */}
      <button
        onClick={() => !lesson.isLocked && onToggle()}
        className={`w-full flex justify-between items-center px-3 py-2.5 rounded-lg transition-all text-left ${
          lesson.isLocked
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-white/[0.03] cursor-pointer"
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {lesson.isLocked && (
            <Lock className="w-3.5 h-3.5 text-white/25 shrink-0" />
          )}
          <span className="text-sm font-medium text-white/60 line-clamp-1">
            {lesson.title}
          </span>
          {lesson.completed && !lesson.isLocked && (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!lesson.isLocked && totalCount > 0 && (
            <span className="text-[10px] text-white/25 font-medium">
              {completedCount}/{totalCount}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-white/25 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Content Items */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col py-1">
              {lesson.items.map((item) => (
                <ContentItem
                  key={item.id}
                  item={item}
                  isLastVisited={item.id === lastVisitedContentId}
                  onClick={onItemClick}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonAccordion;
