"use client";

import React, { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Activity {
  date: string;
  count: number;
}

const Heatmap = () => {
  // Generate last 365 days of data
  const { activities, weeks, months } = useMemo(() => {
    const totalDays = 365;
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays);

    const data: Activity[] = [];
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dateStr = date.toISOString().split("T")[0];
      const r = Math.random();
      let count = 0;
      if (r > 0.9) count = Math.floor(Math.random() * 4) + 1;
      else if (r > 0.7) count = Math.floor(Math.random() * 2) + 1;

      data.push({ date: dateStr, count });
    }

    // Group by weeks
    const weeksData: Activity[][] = [];
    let currentWeek: Activity[] = [];

    // Align start to Sunday
    const startDay = new Date(data[0].date).getDay(); // 0 = Sunday
    for (let i = 0; i < startDay; i++) {
      currentWeek.push({ date: "", count: -1 }); // Placeholder
    }

    data.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksData.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      weeksData.push(currentWeek); // Last partial week
    }

    // Generate Month Labels
    const monthLabels: { name: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeksData.forEach((week, weekIndex) => {
      const firstDay = week.find((d) => d.count !== -1);
      if (firstDay) {
        const month = new Date(firstDay.date).getMonth();
        if (month !== lastMonth) {
          monthLabels.push({
            name: new Date(firstDay.date).toLocaleString("default", {
              month: "short",
            }),
            weekIndex,
          });
          lastMonth = month;
        }
      }
    });

    return { activities: data, weeks: weeksData, months: monthLabels };
  }, []);

  const getColor = (count: number) => {
    if (count === -1) return "invisible"; // Placeholder
    if (count === 0) return "bg-dark-light"; // Empty
    if (count <= 1) return "bg-[#0e4429]";
    if (count <= 2) return "bg-[#006d32]";
    if (count <= 3) return "bg-[#26a641]";
    return "bg-[#39d353]"; // Brightest green
  };

  const totalContributions = activities.reduce(
    (acc, curr) => acc + (curr.count > 0 ? curr.count : 0),
    0,
  );

  return (
    <div className="bg-dark-card! rounded-2xl p-6 flex flex-col relative w-full border border-white/5 text-white/80 h-full overflow-hidden">
      <div className="flex justify-between mb-2 items-center">
        <h1 className="text-xl px-1 tracking font-medium text-white">
          {totalContributions} contributions in the last year
        </h1>
      </div>

      <div className="flex flex-col flex-1 border border-white/5 rounded-xl p-4 bg-dark-light/10 overflow-hidden">
        <div className="flex-1 w-full overflow-x-auto custom-scrollbar pb-2">
          <div className="flex flex-col min-w-max">
            {/* Month Labels */}
            <div className="flex mb-2 text-xs text-white/40 font-apfel pl-8">
              {months.map((month, i) => (
                <div
                  key={i}
                  style={{
                    width: `calc(${14 * (months[i + 1]?.weekIndex - month.weekIndex || 4)}px + ${4 * (months[i + 1]?.weekIndex - month.weekIndex || 4)}px)`, // approx width calculation
                  }}
                  className="flex-1" // Simplify for now
                >
                  {/* Better approach: explicit translation based on week index */}
                </div>
              ))}
              {/* Simple render for now: Just a row of labels spaced loosely? No, let's strictly align them */}
              {/* Re-rendering months correctly matching grid */}
            </div>

            <div className="relative h-6 w-full mb-2">
              {months.map((month, i) => (
                <span
                  key={i}
                  className="absolute text-xs text-white/40"
                  style={{ left: `${month.weekIndex * 15 + 30}px` }} // 14px width + 1px gap approx
                >
                  {month.name}
                </span>
              ))}
            </div>

            <div className="flex gap-1">
              {/* Day Labels */}
              <div className="flex flex-col gap-1 pr-2 pt-0 text-[10px] text-white/30 font-mono leading-[10px]">
                <div className="h-[10px]"></div> {/* Sun */}
                <div className="h-[10px] flex items-center">Mon</div>
                <div className="h-[10px]"></div> {/* Tue */}
                <div className="h-[10px] flex items-center">Wed</div>
                <div className="h-[10px]"></div> {/* Thu */}
                <div className="h-[10px] flex items-center">Fri</div>
                <div className="h-[10px]"></div>
              </div>

              {/* The Grid */}
              <div className="flex gap-[3px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {week.map((activity, dayIndex) => (
                      <TooltipProvider key={`${weekIndex}-${dayIndex}`}>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-[10px] h-[10px] rounded-[2px] ${getColor(activity.count)}`}
                            />
                          </TooltipTrigger>
                          {activity.count !== -1 && (
                            <TooltipContent className="bg-gray-800 border-white/10 text-white text-xs z-50">
                              <p>
                                {activity.count === 0 ? "No" : activity.count}{" "}
                                contributions on {activity.date}
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-white/40 flex items-center justify-between gap-3 px-1 text-xs">
          <a href="#" className="hover:text-primary transition-colors">
            Learn how we count contributions
          </a>
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-[2px]">
              <div className="rounded-[2px] w-[10px] h-[10px] bg-dark-light"></div>
              <div className="rounded-[2px] w-[10px] h-[10px] bg-[#0e4429]"></div>
              <div className="rounded-[2px] w-[10px] h-[10px] bg-[#006d32]"></div>
              <div className="rounded-[2px] w-[10px] h-[10px] bg-[#26a641]"></div>
              <div className="rounded-[2px] w-[10px] h-[10px] bg-[#39d353]"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
