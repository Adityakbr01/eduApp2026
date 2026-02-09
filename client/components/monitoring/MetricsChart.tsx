"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MetricsChartProps {
  data: any[];
  loading: boolean;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  data,
  loading,
}) => {
  if (loading) return <Card className="h-[400px] animate-pulse" />;

  const formattedData = data.map((d) => ({
    ...d,
    time: new Date(d.windowStart).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return (
    <Card className="col-span-4 shadow-sm border-0 bg-transparent sm:bg-card sm:border">
      <CardHeader className="px-0 sm:px-6">
        <CardTitle className="text-lg font-semibold">
          Traffic & Latency
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-0 sm:pl-2">
        <div className="h-[250px] w-full sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted/30"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                yAxisId="left"
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                width={30}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}ms`}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="count"
                name="Reqs"
                stroke="#adfa1d" // Neon green
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="errorCount"
                name="Errs"
                stroke="#ef4444" // Red
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgLatencyMs"
                name="Lat"
                stroke="#3b82f6" // Blue
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
