"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ILiveStream } from "@/services/liveStream";
import { useUpdateStreamStatus } from "@/services/liveStream/mutations";
import {
  Calendar,
  Clock,
  Copy,
  Eye,
  Radio,
  PlayCircle,
  StopCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface LiveStreamCardProps {
  stream: ILiveStream;
  onViewCredentials: (streamId: string) => void;
}

const statusConfig = {
  scheduled: {
    label: "Scheduled",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  live: {
    label: "🔴 LIVE",
    className:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse",
    dot: "bg-red-500",
  },
  ended: {
    label: "Ended",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    dot: "bg-slate-400",
  },
};

export function LiveStreamCard({
  stream,
  onViewCredentials,
}: LiveStreamCardProps) {
  const config = statusConfig[stream.status];
  const { mutate: updateStatus, isPending } = useUpdateStreamStatus();

  const copyLiveId = () => {
    navigator.clipboard.writeText(stream.liveId);
    toast.success("Live ID copied!");
  };

  const handleUpdateStatus = (newStatus: "live" | "ended") => {
    updateStatus({ streamId: stream._id, status: newStatus });
  };

  return (
    <Card className="group transition-all hover:shadow-md border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate">{stream.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {stream.recordingDescription || "No description"}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={cn("shrink-0 text-[10px] font-medium", config.className)}
          >
            <span
              className={cn("w-1.5 h-1.5 rounded-full mr-1.5", config.dot)}
            />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Metadata */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {stream.scheduledAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(stream.scheduledAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(stream.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {stream.recordingProcessed && (
            <span className="flex items-center gap-1 text-emerald-600">
              <Eye className="h-3 w-3" />
              Recording saved
            </span>
          )}
        </div>

        {/* Live ID */}
        <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-md px-2 py-1.5">
          <span className="text-muted-foreground font-mono truncate flex-1">
            ID: {stream.liveId}
          </span>
          <button
            onClick={copyLiveId}
            className="hover:text-foreground text-muted-foreground transition-colors"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {stream.status === "scheduled" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white"
                disabled={isPending}
                onClick={() => handleUpdateStatus("live")}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Go Live
              </Button>
            </div>
          )}

          {stream.status === "live" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                className="flex-1 text-xs"
                disabled={isPending}
                onClick={() => handleUpdateStatus("ended")}
              >
                <StopCircle className="h-4 w-4 mr-2" />
                End Stream
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            {stream.status !== "ended" && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => onViewCredentials(stream._id)}
              >
                <Radio className="h-3 w-3 mr-1.5" />
                View RTMP Credentials
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
