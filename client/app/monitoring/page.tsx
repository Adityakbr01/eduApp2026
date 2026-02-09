"use client";

import React, { useState } from "react";
import { OverviewCards } from "@/components/monitoring/OverviewCards";
import { MetricsChart } from "@/components/monitoring/MetricsChart";
import { LogsTable } from "@/components/monitoring/LogsTable";
import { TraceView } from "@/components/monitoring/TraceView";
import { SystemHealth } from "@/components/monitoring/SystemHealth";
import { useMonitoring } from "@/hooks/useMonitoring";

export default function MonitoringPage() {
  const {
    stats,
    metrics,
    logs,
    loading,
    isLive,
    page,
    setPage,
    totalPages,
    setSearchQuery,
    refresh,
    systemStats,
  } = useMonitoring();
  console.log(stats, metrics, logs);

  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            System Monitoring
          </h1>
          {isLive ? (
            <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full border border-green-200 dark:border-green-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
              </span>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                Live
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-800">
              <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
              <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                Connecting...
              </span>
            </div>
          )}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground bg-muted px-3 py-1 rounded-md">
          Auto-refreshing every 30s
        </div>
      </div>

      <SystemHealth stats={systemStats} loading={loading} />

      <OverviewCards stats={stats} loading={loading} />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
        <MetricsChart data={metrics} loading={loading} />
      </div>

      <LogsTable
        logs={logs}
        loading={loading}
        onSearch={setSearchQuery}
        onRefresh={refresh}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {selectedTraceId && (
        <TraceView
          traceId={selectedTraceId}
          onClose={() => setSelectedTraceId(null)}
        />
      )}
    </div>
  );
}
