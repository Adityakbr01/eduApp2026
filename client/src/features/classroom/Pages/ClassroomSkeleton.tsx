"use client";

import { Skeleton } from "@/components/ui/skeleton";

/** Single course card skeleton */
function CourseCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] mb-4">
      {/* Thumbnail */}
      <Skeleton className="w-32 h-20 md:w-40 md:h-24 rounded-xl bg-white/5 shrink-0" />

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between gap-2 py-1">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-3/4 bg-white/5" />
          <Skeleton className="h-3 w-1/3 bg-white/5" />
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-2 flex-1 rounded-full bg-white/5" />
          <Skeleton className="h-3 w-10 bg-white/5" />
        </div>
      </div>
    </div>
  );
}

/** Notification skeleton row */
function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 border-b border-white/5">
      <Skeleton className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-5/6 bg-white/5" />
        <Skeleton className="h-3 w-1/2 bg-white/5" />
      </div>
      <Skeleton className="h-3 w-12 bg-white/5 shrink-0" />
    </div>
  );
}

/** Heatmap skeleton */
function HeatmapSkeleton() {
  return (
    <div className="p-5 flex flex-col gap-3">
      <Skeleton className="h-5 w-32 bg-white/5" />
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: 52 }).map((_, i) => (
          <Skeleton key={i} className="w-3 h-3 rounded-sm bg-white/5" />
        ))}
      </div>
    </div>
  );
}

/** Course list skeleton — replaces the inline loader */
export function CourseListSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 4 }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Right column skeleton (notifications + heatmap) */
export function RightColumnSkeleton() {
  return (
    <div className="w-[35%] max-lg:min-h-[500px] flex flex-col gap-5 max-lg:w-full">
      {/* Notifications */}
      <div className="rounded-2xl flex flex-col relative flex-1 w-full overflow-hidden bg-dark-card border border-white/5">
        <div className="flex items-center gap-2 w-full h-16 shrink-0 px-6 bg-dark-extra-light border-b border-white/10">
          <Skeleton className="h-5 w-36 bg-white/5" />
        </div>
        <div className="flex flex-col">
          {Array.from({ length: 5 }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-2xl bg-dark-card border border-white/5">
        <HeatmapSkeleton />
      </div>
    </div>
  );
}
