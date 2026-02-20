"use client";

import { Skeleton } from "@/components/ui/skeleton";

/** Sidebar skeleton */
function SidebarSkeleton() {
  return (
    <div className="w-[280px] shrink-0 hidden md:flex flex-col gap-4 p-4">
      {/* Title */}
      <Skeleton className="h-6 w-3/4 bg-white/5" />
      <Skeleton className="h-4 w-1/2 bg-white/5" />

      {/* Content list items */}
      <div className="flex flex-col gap-3 mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg bg-white/5" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-full bg-white/5" />
              <Skeleton className="h-3 w-2/3 bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Content player panel skeleton */
function ContentPlayerSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-4 p-4">
      {/* Video / content area */}
      <Skeleton className="w-full aspect-video rounded-2xl bg-white/5" />

      {/* Controls bar */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-24 rounded-xl bg-white/5" />
        <Skeleton className="h-10 w-24 rounded-xl bg-white/5" />
        <Skeleton className="h-10 flex-1 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

/** Class info panel skeleton */
function ClassInfoSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Title */}
      <Skeleton className="h-7 w-3/4 bg-white/5" />
      <Skeleton className="h-4 w-1/2 bg-white/5" />

      {/* Badges */}
      <div className="flex gap-2 mt-2">
        <Skeleton className="h-6 w-16 rounded-full bg-white/5" />
        <Skeleton className="h-6 w-20 rounded-full bg-white/5" />
      </div>

      {/* Description block */}
      <div className="flex flex-col gap-2 mt-4">
        <Skeleton className="h-3 w-16 bg-white/5" />
        <Skeleton className="h-4 w-full bg-white/5" />
        <Skeleton className="h-4 w-5/6 bg-white/5" />
        <Skeleton className="h-4 w-2/3 bg-white/5" />
      </div>

      {/* Tags */}
      <div className="flex gap-2 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-14 rounded-full bg-white/5" />
        ))}
      </div>
    </div>
  );
}

/** Full lesson detail skeleton combining all panels */
export default function LessonDetailSkeleton() {
  return (
    <main className="relative flex flex-col bg-black py-7 px-5 gap-5 font-apfel font-normal md:flex-row md:gap-3 h-[calc(100vh-60px)]">
      {/* Sidebar */}
      <SidebarSkeleton />

      {/* Main content area */}
      <div className="flex flex-1 h-full overflow-hidden gap-3">
        {/* Left: Info panel */}
        <div className="hidden md:block w-[40%] bg-dark-card rounded-2xl border border-white/5 overflow-hidden">
          <ClassInfoSkeleton />
        </div>

        {/* Right: Content player */}
        <div className="flex-1 bg-dark-card rounded-2xl border border-white/5 overflow-hidden">
          <ContentPlayerSkeleton />
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="fixed bottom-0 left-0 right-0 h-14 bg-dark-card border-t border-white/5 flex items-center justify-between px-6">
        <Skeleton className="h-8 w-24 rounded-lg bg-white/5" />
        <Skeleton className="h-4 w-20 bg-white/5" />
        <Skeleton className="h-8 w-24 rounded-lg bg-white/5" />
      </div>
    </main>
  );
}
