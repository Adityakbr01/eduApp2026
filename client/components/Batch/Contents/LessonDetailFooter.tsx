"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface LessonDetailFooterProps {
  onPrevious?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalLessons?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const LessonDetailFooter = ({
  onPrevious,
  onNext,
  currentIndex = 1,
  totalLessons = 1,
  hasPrevious = false,
  hasNext = false,
}: LessonDetailFooterProps) => {
  return (
    <div className="fixed bottom-0 left-0 justify-around md:justify-center md:gap-20 flex z-50 py-4 bg-[#111111] w-full border-t border-white/5">
      <Button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="group flex items-center justify-center w-10 h-10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg bg-white/5 hover:bg-white/10 disabled:hover:bg-white/5 transition-all border border-white/10 text-white/90 shadow-lg backdrop-blur-lg"
      >
        <ChevronLeft className="w-5 h-5 text-primary group-hover:-translate-x-0.5 group-disabled:translate-x-0 transition-transform" />
      </Button>

      <div className="group flex items-center justify-center gap-2 py-2 px-6 rounded-lg bg-white/5 border border-white/10 text-white/70 shadow-lg backdrop-blur-lg text-sm font-medium min-w-[120px]">
        Lesson {currentIndex}/{totalLessons}
      </div>

      <Button
        onClick={onNext}
        disabled={!hasNext}
        className="group flex items-center justify-center w-10 h-10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg bg-white/5 hover:bg-white/10 disabled:hover:bg-white/5 transition-all border border-white/10 text-white/90 shadow-lg backdrop-blur-lg"
      >
        <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-0.5 group-disabled:translate-x-0 transition-transform" />
      </Button>
    </div>
  );
};

export default LessonDetailFooter;
