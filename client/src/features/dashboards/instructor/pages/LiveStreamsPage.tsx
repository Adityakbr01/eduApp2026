"use client";

import { Badge } from "@/components/ui/badge";
import { ICourse } from "@/services/courses";
import { useGetInstructorLiveStreams } from "@/services/liveStream";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetAccessStatus } from "@/services/liveStream/queries";
import { useRequestAccess } from "@/services/liveStream/mutations";
import {
  Radio,
  Wifi,
  WifiOff,
  AlertCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useState, useMemo } from "react";
import { LiveStreamCard } from "../components/liveStream/LiveStreamCard";
import { CreateLiveSessionDialog } from "../components/liveStream/CreateLiveSessionDialog";
import { RTMPCredentialsDialog } from "../components/liveStream/RTMPCredentialsDialog";

interface LiveStreamsPageProps {
  courses: ICourse[];
}

export function LiveStreamsPage({ courses }: LiveStreamsPageProps) {
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [credentialsStreamId, setCredentialsStreamId] = useState<string | null>(
    null,
  );

  const activeCourseId = courseFilter === "all" ? undefined : courseFilter;

  // Access Request Logic
  const { data: accessData } = useGetAccessStatus();
  const { mutate: requestAccess, isPending: isRequestingAccess } =
    useRequestAccess();
  const accessStatus = accessData?.data?.status || "none";

  const { data, isLoading } = useGetInstructorLiveStreams(activeCourseId);

  const streams = useMemo(() => data?.data || [], [data]);

  const liveCount = useMemo(
    () => streams.filter((s) => s.status === "live").length,
    [streams],
  );

  const scheduledCount = useMemo(
    () => streams.filter((s) => s.status === "scheduled").length,
    [streams],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-500" />
            Live Streams
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your live streaming sessions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats Badges */}
          {liveCount > 0 && (
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse"
            >
              <Wifi className="h-3 w-3 mr-1" />
              {liveCount} Live
            </Badge>
          )}
          {scheduledCount > 0 && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              {scheduledCount} Scheduled
            </Badge>
          )}

          {/* Course Filter */}
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Create Button */}
          {accessStatus === "approved" && (
            <CreateLiveSessionDialog courses={courses} />
          )}
        </div>
      </div>

      {/* Access Request Banner */}
      {accessStatus === "none" && (
        <Alert className="bg-blue-500/10 text-blue-500 border-none flex items-center justify-between">
          <div>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Streaming Access Required</AlertTitle>
            <AlertDescription>
              You need to request VdoCipher live streaming access before
              creating sessions.
            </AlertDescription>
          </div>
          <Button
            size="sm"
            onClick={() => requestAccess()}
            disabled={isRequestingAccess}
          >
            {isRequestingAccess ? "Requesting..." : "Request Access"}
          </Button>
        </Alert>
      )}

      {accessStatus === "pending" && (
        <Alert className="bg-amber-500/10 text-amber-500 border-none">
          <Clock className="h-4 w-4" />
          <AlertTitle>Request Pending</AlertTitle>
          <AlertDescription>
            Your request for live streaming access is currently pending admin
            approval.
          </AlertDescription>
        </Alert>
      )}

      {accessStatus === "rejected" && (
        <Alert className="bg-rose-500/10 text-rose-500 border-none flex items-center justify-between">
          <div>
            <XCircle className="h-4 w-4" />
            <AlertTitle>Request Rejected</AlertTitle>
            <AlertDescription>
              Your request for live streaming access was denied by an admin.
            </AlertDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => requestAccess()}
            disabled={isRequestingAccess}
          >
            Request Again
          </Button>
        </Alert>
      )}

      {/* Stream Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-lg border bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      ) : accessStatus !== "approved" ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <WifiOff className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-sm font-semibold">Access Required</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            You must be approved for live streaming before creating and managing
            sessions.
          </p>
        </div>
      ) : streams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <WifiOff className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-sm font-semibold">No live streams yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Create your first live session to start streaming. Make sure live
            streaming is enabled for the course by an admin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {streams.map((stream) => (
            <LiveStreamCard
              key={stream._id}
              stream={stream}
              onViewCredentials={setCredentialsStreamId}
            />
          ))}
        </div>
      )}

      {/* RTMP Credentials Dialog */}
      <RTMPCredentialsDialog
        streamId={credentialsStreamId}
        open={!!credentialsStreamId}
        onClose={() => setCredentialsStreamId(null)}
      />
    </div>
  );
}
