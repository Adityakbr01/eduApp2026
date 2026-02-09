import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Cpu, Database, Clock } from "lucide-react";

interface SystemStats {
  cpu: { load: number; cores: number };
  memory: { total: number; active: number; free: number; usedPercent: number };
  uptime: { seconds: number; startedAt: string };
  timestamp: string;
}

interface SystemHealthProps {
  stats: SystemStats | null;
  loading: boolean;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({
  stats,
  loading,
}) => {
  if (loading || !stats) {
    return (
      <Card className="col-span-1 md:col-span-2 shadow-sm border animate-pulse h-[200px]" />
    );
  }

  const formatBytes = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.floor(bytes / Math.pow(1024, i)) + " " + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  const getStatusColor = (percent: number) => {
    if (percent < 50) return "bg-green-500";
    if (percent < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="col-span-1 md:col-span-3 shadow-sm border-0 bg-transparent sm:bg-card sm:border">
      <CardHeader className="px-0 sm:px-6 py-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 sm:px-6 grid gap-6 grid-cols-2 sm:grid-cols-4">
        {/* CPU */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Cpu className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">CPU Load</span>
          </div>
          <div className="text-2xl font-bold">{stats.cpu.load}%</div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full ${getStatusColor(stats.cpu.load)} transition-all duration-500`}
              style={{ width: `${stats.cpu.load}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.cpu.cores} Cores
          </p>
        </div>

        {/* RAM */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Database className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Memory</span>
          </div>
          <div className="text-2xl font-bold">{stats.memory.usedPercent}%</div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full ${getStatusColor(stats.memory.usedPercent)} transition-all duration-500`}
              style={{ width: `${stats.memory.usedPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {formatBytes(stats.memory.active)} /{" "}
            {formatBytes(stats.memory.total)}
          </p>
        </div>

        {/* Uptime */}
        <div className="flex flex-col gap-2 col-span-2 sm:col-span-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Uptime</span>
          </div>
          <div className="text-2xl font-bold">
            {formatUptime(stats.uptime.seconds)}
          </div>
          <p className="text-xs text-muted-foreground">
            Since {new Date(stats.uptime.startedAt).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
