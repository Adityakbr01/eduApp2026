"use client";

import { Button } from "@/components/ui/button";
import getStatusBadge from "@/lib/utils/getStatusBadge";
import type {
  Lesson,
  Module
} from "@/services/classroom/batch-types";
import { ChevronDown, Lock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import LessonRow from "./LessonRow";

interface SectionAccordionProps {
  section: Module;
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick: (item: Lesson) => void;
  lastVisitedId?: string;
}

const SectionAccordion = ({
  section,
  isExpanded,
  onToggle,
  onItemClick,
  lastVisitedId,
}: SectionAccordionProps) => {
  // Flatten all items from all lesson
  const isCompleted = section.completed;

  // Status badge

  return (
    <div className="border-b border-white/5">
      {/* Section Header */}
      <button
        onClick={() => !section.isLocked && onToggle()}
        className={`w-full flex justify-between items-center px-8 py-7 transition-all text-left ${
          section.isLocked
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-white/[0.02] cursor-pointer"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {section.isLocked && (
            <Lock className="w-4 h-4 text-white/25 shrink-0" />
          )}
          <span className="text-[1.3rem] md:text-[1.4rem] font-semibold text-white">
            {section.title}
          </span>
          {getStatusBadge(
            section,
            isCompleted!,
            section.lessons?.length!,
            section.lessons?.length!,
          )}
        </div>

        <div className="flex items-center gap-4">
          {!isExpanded &&
            lastVisitedId &&
            (() => {
              const lastLesson = section.lessons?.find(
                (l) => l.id === lastVisitedId,
              );
              if (lastLesson && !lastLesson.isLocked) {
                return (
                  <Button
                    type="button"
                    className="cursor-pointer btn btn-primary md:hover:scale-105 transition-all text-xs px-3 py-1.5 h-auto font-normal shrink-0 shadow-doubt"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onItemClick(lastLesson);
                    }}
                  >
                    {lastLesson.completed ? "Review" : "Resume"}
                  </Button>
                );
              }
              return null;
            })()}

          <ChevronDown
            className={`w-5 h-5 text-white/30 transition-transform duration-200 shrink-0 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Section Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-5 px-8 py-3">
              {section?.lessons?.map((item) => (
                <LessonRow
                  key={item.id}
                  item={item}
                  isLastVisited={item.id === lastVisitedId}
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

export default SectionAccordion;
