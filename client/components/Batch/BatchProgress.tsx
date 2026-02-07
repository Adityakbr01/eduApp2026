"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface BatchProgressProps {
  data: {
    title: string;
    progress: number;
    modules: number;
    totalModules: number;
    subModules: number;
    totalSubModules: number;
    score: number;
    totalScore: number;
  };
}

const BatchProgress = ({ data }: BatchProgressProps) => {
  return (
    <div className="bg-dark-card border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-2 min-w-0">
        <Link
          href="/classroom"
          className="flex group/back md:mr-2 items-center gap-2 text-white/80 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="w-5 h-5 shrink-0 group-hover/back:-translate-x-1 transition-transform" />
          <span className="text-sm sm:text-base font-medium group-hover/back:text-white transition-colors">
            Back
          </span>
        </Link>

        <h1 className="text-base sm:text-xl md:text-2xl font-bold leading-snug line-clamp-2 break-words min-w-0">
          {data.title}
        </h1>
      </div>

      {/* Progress Card */}
      <div className="w-full border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-6 md:p-8 flex flex-col gap-3 sm:gap-4 bg-white/5 backdrop-blur-sm min-w-0">
        <div className="text-(--custom-accentColor) text-base sm:text-xl font-medium">
          {data.progress}% Complete
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-primary rounded-full"
          />
        </div>

        {/* Stats — MOBILE FIRST */}
        <div className="flex flex-col md:flex-row md:justify-between gap-2 text-xs sm:text-sm md:text-base text-white/70 font-medium">
          <div>
            Modules:
            <span className="text-white ml-1">
              {data.modules}/{data.totalModules}
            </span>
          </div>

          <div>
            Sub-Modules:
            <span className="text-white ml-1">
              {data.subModules}/{data.totalSubModules}
            </span>
          </div>

          <div>
            Score:
            <span className="text-(--custom-accentColor) ml-1 break-all">
              {data.score}/{(data.totalScore / 1000).toFixed(2)}k
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchProgress;
