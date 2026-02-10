"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Lock, CheckCircle } from "lucide-react";
import type { Module, ModuleItem } from "@/services/classroom/batch-types";
import LessonAccordion from "./LessonAccordion";

interface ModuleAccordionProps {
  module: Module;
  isExpanded: boolean;
  onToggle: () => void;
  expandedLessons: string[];
  onToggleLesson: (id: string) => void;
  onItemClick: (item: ModuleItem) => void;
  lastVisitedContentId?: string;
}

const ModuleAccordion = ({
  module,
  isExpanded,
  onToggle,
  expandedLessons,
  onToggleLesson,
  onItemClick,
  lastVisitedContentId,
}: ModuleAccordionProps) => {
  const totalItems = module.lessons.reduce((s, l) => s + l.items.length, 0);
  const completedItems = module.lessons.reduce(
    (s, l) => s + l.items.filter((i) => i.completed).length,
    0,
  );
  const totalMarks = module.lessons.reduce(
    (s, l) => s + l.items.reduce((a, i) => a + (i.marks || 0), 0),
    0,
  );
  const obtainedMarks = module.lessons.reduce(
    (s, l) =>
      s +
      l.items
        .filter((i) => i.completed)
        .reduce((a, i) => a + (i.obtainedMarks || 0), 0),
    0,
  );

  return (
    <div className="border-b border-white/5">
      {/* Module Header */}
      <button
        onClick={() => !module.isLocked && onToggle()}
        className={`w-full flex justify-between items-center px-6 py-5 transition-all text-left ${
          module.isLocked
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-white/[0.03] cursor-pointer"
        }`}
      >
        <div className="flex flex-col min-w-0 gap-1">
          <div className="flex items-center gap-2">
            {module.isLocked && (
              <Lock className="w-4 h-4 text-white/25 shrink-0" />
            )}
            <span className="text-[15px] font-semibold text-white/90 line-clamp-1">
              {module.title}
            </span>
            {module.completed && !module.isLocked && (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
          </div>

          {/* Stats */}
          {!module.isLocked && (
            <div className="flex items-center gap-2 text-[11px] text-white/25">
              <span>
                {completedItems}/{totalItems} items
              </span>
              {totalMarks > 0 && (
                <>
                  <span>·</span>
                  <span className={module.completed ? "text-primary/60" : ""}>
                    {obtainedMarks}/{totalMarks} marks
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <ChevronDown
          className={`w-5 h-5 text-white/30 transition-transform duration-200 shrink-0 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Module Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-0.5 px-4 pb-4">
              {module.lessons.map((lesson) => (
                <LessonAccordion
                  key={lesson.id}
                  lesson={lesson}
                  isExpanded={expandedLessons.includes(lesson.id)}
                  onToggle={() => onToggleLesson(lesson.id)}
                  onItemClick={onItemClick}
                  lastVisitedContentId={lastVisitedContentId}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModuleAccordion;
