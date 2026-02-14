"use client";

import { classroomApi } from "@/services/classroom/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface Activity {
  date: string;
  count: number;
  isFuture: boolean;
}

const TOTAL_DAYS = 140; // approx 20 weeks (fills nicely)

const Heatmap = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["classroom", "heatmap"],
    queryFn: () => classroomApi.getHeatmapData(),
    staleTime: 1000 * 60 * 60,
  });

  const apiActivities = data?.data || [];

  const { weeksCount, flattened, total } = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - TOTAL_DAYS);

    const activityMap = new Map<string, number>();
    apiActivities.forEach((a: any) => activityMap.set(a.date, a.count));

    const days: Activity[] = [];

    for (let i = 0; i <= TOTAL_DAYS; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const iso = date.toISOString().split("T")[0];
      const isFuture = date > today;

      days.push({
        date: iso,
        count: isFuture ? 0 : activityMap.get(iso) || 0,
        isFuture,
      });
    }

    // Align start to Sunday
    const firstDay = new Date(days[0].date).getDay();
    const paddingStart = Array.from({ length: firstDay }).map(() => ({
      date: "",
      count: 0,
      isFuture: false,
    }));

    const padded = [...paddingStart, ...days];

    // Ensure full week alignment
    while (padded.length % 7 !== 0) {
      padded.push({ date: "", count: 0, isFuture: false });
    }

    const weeksCount = padded.length / 7;

    const total = days.reduce((a, b) => a + b.count, 0);

    return {
      flattened: padded,
      weeksCount,
      total,
    };
  }, [apiActivities]);

  const getColor = (count: number, isFuture: boolean) => {
    if (isFuture) return "bg-neutral-700/40"; // greyed future
    if (count === 0) return "bg-[#2A2A2A]";
    if (count <= 2) return "bg-[#EE9477]";
    if (count <= 5) return "bg-[#E07B5A]";
    if (count <= 10) return "bg-[#CF6541]";
    return "bg-[#9C4323]";
  };

  if (isLoading) {
    return (
      <div className="h-44 rounded-xl border border-white/5 bg-neutral-900 animate-pulse" />
    );
  }

  return (
    <div className="w-full rounded-xl border border-white/5 bg-neutral-900 p-6 text-white">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-medium text-(--custom-accentColor)">
          Crushed {total} activities so far!
        </h2>
      </div>

      <div
        className="grid gap-1 w-full select-none border p-3 rounded-lg border-white/10"
        style={{
          gridTemplateRows: "repeat(7, minmax(0, 1fr))",
          gridTemplateColumns: `repeat(${weeksCount}, minmax(0, 1fr))`,
          gridAutoFlow: "column",
        }}
      >
        {flattened.map((day, index) => (
          <TooltipProvider key={index}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div
                  className={`
                    relative w-full aspect-square rounded-sm
                    transition-colors duration-300
                    text-white
                    ${getColor(day.count, day.isFuture)}
                  `}
                />
              </TooltipTrigger>

              {day.date && !day.isFuture && (
                <TooltipContent className="text-xs text-white bg-neutral-900 border border-white/10">
                  {day.count === 0 ? "No" : day.count} activities on {day.date}
                </TooltipContent>
              )}

              {day.date && day.isFuture && (
                <TooltipContent className="text-xs text-white bg-neutral-900 border border-white/10">
                  Future date
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      <div className="flex justify-end items-center gap-2 mt-4 text-xs text-white/40">
        <span>Less</span>
        <div className="flex gap-[3px]">
          <div className="w-3 h-3 rounded bg-[#2A2A2A]" />
          <div className="w-3 h-3 rounded bg-[#EE9477]" />
          <div className="w-3 h-3 rounded bg-[#E07B5A]" />
          <div className="w-3 h-3 rounded bg-[#CF6541]" />
          <div className="w-3 h-3 rounded bg-[#9C4323]" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default Heatmap;
