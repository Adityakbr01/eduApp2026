"use client";

import { Skeleton } from "@/components/ui/skeleton";

/** Progress card skeleton */
function ProgressSkeleton() {
  return (
    <div className="bg-dark-card rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32 bg-white/5" />
        <Skeleton className="h-5 w-16 bg-white/5 rounded-full" />
      </div>

      {/* Progress bar */}
      <Skeleton className="h-3 w-full rounded-full bg-white/5" />

      {/* Stats row */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-20 bg-white/5" />
          <Skeleton className="h-6 w-12 bg-white/5" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-24 bg-white/5" />
          <Skeleton className="h-6 w-16 bg-white/5" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-16 bg-white/5" />
          <Skeleton className="h-6 w-10 bg-white/5" />
        </div>
      </div>
    </div>
  );
}

/** Section / module skeleton */
function SectionModulesSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, sectionIdx) => (
        <div
          key={sectionIdx}
          className="bg-dark-card rounded-2xl border border-white/5 overflow-hidden"
        >
          {/* Section header */}
          <div className="p-5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg bg-white/5" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-40 bg-white/5" />
                <Skeleton className="h-3 w-24 bg-white/5" />
              </div>
            </div>
            <Skeleton className="w-5 h-5 rounded bg-white/5" />
          </div>

          {/* Lesson items */}
          <div className="p-3 flex flex-col gap-1">
            {Array.from({ length: 3 + sectionIdx }).map((_, lessonIdx) => (
              <div
                key={lessonIdx}
                className="flex items-center gap-3 px-3 py-3 rounded-xl"
              >
                <Skeleton className="w-7 h-7 rounded-lg bg-white/5 shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <Skeleton
                    className="h-3.5 bg-white/5"
                    style={{ width: `${60 + ((lessonIdx * 13) % 30)}%` }}
                  />
                  <Skeleton className="h-2.5 w-20 bg-white/5" />
                </div>
                <Skeleton className="w-4 h-4 rounded-full bg-white/5 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Leaderboard / right panel skeleton */
function LeaderboardSkeleton() {
  return (
    <div className="bg-dark-card rounded-2xl border border-white/5 p-6 flex flex-col gap-5 h-full">
      {/* Title */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28 bg-white/5" />
        <Skeleton className="h-4 w-16 bg-white/5" />
      </div>

      {/* Podium area */}
      <div className="flex items-end justify-center gap-4 py-6">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="w-12 h-12 rounded-full bg-white/5" />
          <Skeleton className="h-16 w-16 rounded-t-lg bg-white/5" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="w-14 h-14 rounded-full bg-white/5" />
          <Skeleton className="h-24 w-16 rounded-t-lg bg-white/5" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="w-12 h-12 rounded-full bg-white/5" />
          <Skeleton className="h-12 w-16 rounded-t-lg bg-white/5" />
        </div>
      </div>

      {/* Leaderboard rows */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-2">
            <Skeleton className="w-6 h-6 rounded bg-white/5 shrink-0" />
            <Skeleton className="w-9 h-9 rounded-full bg-white/5 shrink-0" />
            <div className="flex-1 flex flex-col gap-1">
              <Skeleton
                className="h-3.5 bg-white/5"
                style={{ width: `${50 + ((i * 17) % 35)}%` }}
              />
              <Skeleton className="h-2.5 w-16 bg-white/5" />
            </div>
            <Skeleton className="h-4 w-12 bg-white/5 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Sidebar actions skeleton */
function SidebarActionsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="w-12 h-12 rounded-xl bg-white/5" />
      ))}
    </div>
  );
}

/** Full batch detail skeleton */
export default function BatchDetailSkeleton() {
  return (
    <div className="relative h-auto min-h-screen xl:h-screen flex flex-col xl:flex-row w-full bg-[#171717] py-6 px-4 md:px-6 gap-6 text-white overflow-y-auto xl:overflow-hidden pb-24 xl:pb-6">
      <div className="w-full h-full xl:flex xl:gap-6">
        {/* MOBILE: simplified stacked layout */}
        <div className="xl:hidden w-full flex flex-col gap-6">
          <ProgressSkeleton />
          <SectionModulesSkeleton />
        </div>

        {/* DESKTOP: Left column */}
        <div className="hidden xl:flex flex-col gap-6 w-[55%] h-full overflow-hidden pb-10">
          <ProgressSkeleton />
          <SectionModulesSkeleton />
        </div>

        {/* DESKTOP: Right column */}
        <div className="hidden xl:flex flex-row gap-6 w-[45%] h-full">
          <div className="flex-1 min-h-0 overflow-hidden">
            <LeaderboardSkeleton />
          </div>
          <div className="w-auto shrink-0">
            <SidebarActionsSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
