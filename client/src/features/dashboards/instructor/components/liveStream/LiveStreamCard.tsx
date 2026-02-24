"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ILiveStream } from "@/services/liveStream";
import { useUpdateStreamStatus } from "@/services/liveStream/mutations";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Info,
  PlayCircle,
  Radio,
  StopCircle,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useCallback, useState } from "react";

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
    border: "border-amber-200/60 dark:border-amber-800/40",
  },
  live: {
    label: "🔴 LIVE NOW",
    className:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse",
    dot: "bg-red-500",
    border: "border-red-300/60 dark:border-red-800/40",
  },
  ended: {
    label: "Ended",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    dot: "bg-slate-400",
    border: "border-border/50",
  },
};

export function LiveStreamCard({
  stream,
  onViewCredentials,
}: LiveStreamCardProps) {
  const config = statusConfig[stream.status];
  const { mutate: updateStatus, isPending } = useUpdateStreamStatus();

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  }, []);

  const handleUpdateStatus = (newStatus: "live" | "ended") => {
    updateStatus({ streamId: stream._id, status: newStatus });
  };

  const showWebhookFallback =
    stream.status === "ended" && !stream.recordingProcessed;

  const [showPreview, setShowPreview] = useState(false);

  // Player URL for preview (works for both live & recorded)
  const previewUrl = `https://player.vdocipher.com/live-v2?liveId=${stream.liveId}`;

  // Format relative time
  const getRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <Card
      className={cn(
        "group transition-all hover:shadow-lg",
        config.border,
        stream.status === "live" && "ring-1 ring-red-400/30 shadow-red-500/5",
      )}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-muted-foreground shrink-0" />
              <h3 className="text-sm font-semibold truncate">{stream.title}</h3>
            </div>
            {stream.recordingDescription && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 pl-6">
                {stream.recordingDescription}
              </p>
            )}
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "shrink-0 text-[10px] font-semibold px-2.5 py-0.5",
              config.className,
            )}
          >
            <span
              className={cn("w-1.5 h-1.5 rounded-full mr-1.5", config.dot)}
            />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      {/* ── Live / Recording Preview ───────────────────────────────── */}
      <CardContent className="pt-0 pb-0">
        <button
          type="button"
          onClick={() => setShowPreview((p) => !p)}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-lg border border-dashed py-2 text-xs font-medium transition-all cursor-pointer mb-3",
            showPreview
              ? "border-primary/40 bg-primary/5 text-primary"
              : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
          )}
        >
          {showPreview ? (
            <>
              <Eye className="h-3.5 w-3.5" />
              Hide Preview
            </>
          ) : (
            <>
              <PlayCircle className="h-3.5 w-3.5" />
              {stream.status === "live" ? "Live Preview" : "Preview Recording"}
            </>
          )}
        </button>

        {showPreview && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black mb-3 ring-1 ring-border/50">
            <iframe
              src={previewUrl}
              allow="encrypted-media; autoplay; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
              title={`Preview: ${stream.title}`}
            />
            <div className="absolute top-2 left-2 z-10">
              <Badge
                variant="secondary"
                className="text-[9px] bg-black/60 text-white border-0 backdrop-blur-sm"
              >
                {stream.status === "live" ? "🔴 LIVE" : "RECORDING"} ·{" "}
                {stream.liveId.slice(0, 8)}…
              </Badge>
            </div>
          </div>
        )}
      </CardContent>

      <CardContent className="pt-0 space-y-3">
        {/* ── Metadata Row ──────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {stream.scheduledAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {new Date(stream.scheduledAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {new Date(stream.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            <span className="text-muted-foreground/50">
              ({getRelativeTime(stream.createdAt)})
            </span>
          </span>
          {stream.recordingProcessed && (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-3 w-3" />
              Recording saved
            </span>
          )}
          {stream.autoSaveRecording &&
            !stream.recordingProcessed &&
            stream.status === "ended" && (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Info className="h-3 w-3" />
                Auto-save pending
              </span>
            )}
        </div>

        <Separator className="opacity-50" />

        {/* ── Live ID — always visible ──────────────────────────────── */}
        <div className="flex items-center gap-2 text-xs bg-muted/40 rounded-lg px-3 py-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
            Live ID
          </span>
          <code className="text-foreground/80 font-mono truncate flex-1 text-[11px]">
            {stream.liveId}
          </code>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => copyToClipboard(stream.liveId, "Live ID")}
                  className="hover:text-foreground cursor-pointer text-muted-foreground transition-colors p-0.5 rounded hover:bg-muted"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Tap to copy</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* ── Webhook fallback — manual recording info ──────────────── */}
        {showWebhookFallback && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 p-3 space-y-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  Recording not auto-saved
                </p>
                <p className="text-[11px] leading-relaxed text-amber-700/80 dark:text-amber-400/70">
                  The webhook didn&apos;t process this recording automatically.
                  You can manually save it as lesson content.
                </p>
              </div>
            </div>

            {/* Copyable Video ID */}
            <CopyableId
              label="Video ID"
              value={stream.liveId}
              onCopy={() => copyToClipboard(stream.liveId, "Video ID")}
            />

            {/* Step-by-step instructions */}
            <div className="bg-white/40 dark:bg-white/5 rounded-md p-2.5 space-y-2">
              <p className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                How to save manually
              </p>
              <ol className="space-y-1.5">
                {[
                  "Go to Curriculum → select the Lesson",
                  'Click "Add Content" → choose Video type',
                  'Select "VdoCipher Video ID" mode',
                  "Paste the Video ID above and save",
                ].map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[11px] text-amber-700/80 dark:text-amber-400/60"
                  >
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-200/60 dark:bg-amber-800/30 text-amber-800 dark:text-amber-300 text-[9px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* ── Actions ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 pt-1">
          {stream.status === "scheduled" && (
            <Button
              size="sm"
              className="w-full text-xs bg-red-600 hover:bg-red-700 text-white"
              disabled={isPending}
              onClick={() => handleUpdateStatus("live")}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Go Live
            </Button>
          )}

          {stream.status === "live" && (
            <Button
              size="sm"
              variant="destructive"
              className="w-full text-xs"
              disabled={isPending}
              onClick={() => handleUpdateStatus("ended")}
            >
              <StopCircle className="h-4 w-4 mr-2" />
              End Stream
            </Button>
          )}

          {stream.status !== "ended" && (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => onViewCredentials(stream._id)}
            >
              <Radio className="h-3 w-3 mr-1.5" />
              View RTMP Credentials
            </Button>
          )}

          {stream.status === "ended" && stream.recordingProcessed && (
            <div className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <Eye className="h-3.5 w-3.5" />
              <span className="font-medium">Recording available in lesson</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Copyable ID chip ────────────────────────────────────────────────────────
function CopyableId({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 bg-white/60 dark:bg-white/5 rounded-md px-2.5 py-2 border border-amber-200/60 dark:border-amber-800/30">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 shrink-0 uppercase tracking-wider">
          {label}
        </span>
        <code className="text-xs font-mono text-amber-900 dark:text-amber-200 truncate">
          {value}
        </code>
      </div>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onCopy}
              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors cursor-pointer shrink-0 p-0.5 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Tap to copy</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
