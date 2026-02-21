"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="fixed bottom-0 left-0 justify-around md:justify-center md:gap-20 flex z-50 py-4 bg-[#111111] w-full">
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="group flex items-center disabled:opacity-30 disabled:cursor-not-allowed gap-2 py-[.5rem] rounded-[8px] bg-dark-light/10 hover:bg-dark-light/15 disabled:hover:bg-dark-light/10 transition-all border border-dark-light/30 text-white/90 shadow-lg backdrop-blur-lg px-3 justify-center text-xl"
      >
        <ChevronLeft
          size={20}
          className="text-accent group-hover:-translate-x-0.5 group-disabled:translate-x-0 transition-transform"
        />
      </button>

      <div className="group flex items-center gap-2 py-[.5rem] px-12 rounded-[8px] bg-dark-light/10 hover:bg-dark-light/15 transition-all border border-dark-light/30 text-white/70 shadow-lg backdrop-blur-lg justify-center text-lg min-w-[120px]">
        Lesson {currentIndex}/{totalLessons}
      </div>

      <button
        onClick={onNext}
        disabled={!hasNext}
        className="group flex items-center disabled:opacity-30 disabled:cursor-not-allowed gap-2 py-[.5rem] rounded-[8px] bg-dark-light/10 hover:bg-dark-light/15 disabled:hover:bg-dark-light/10 transition-all border border-dark-light/30 text-white/90 shadow-lg backdrop-blur-lg px-3 justify-center text-xl"
      >
        <ChevronRight
          size={20}
          className="text-accent group-hover:translate-x-0.5 group-disabled:translate-x-0 transition-transform"
        />
      </button>
    </div>
  );
};

export default LessonDetailFooter;
