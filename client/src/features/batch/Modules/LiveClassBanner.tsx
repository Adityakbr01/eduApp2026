"use client";

import { Radio } from "lucide-react";
import { useGetStudentLiveStream } from "@/services/liveStream/queries";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { socketUrl, SOCKET_KEYS } from "@/constants/SOCKET_IO";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query-keys";

interface LiveClassBannerProps {
  courseId: string;
}

const LiveClassBanner = ({ courseId }: LiveClassBannerProps) => {
  const router = useRouter();
  const params = useParams();
  const batchId = params?.batchId as string;
  const queryClient = useQueryClient();

  console.log("courseId", courseId);

  const { data: streamResponse, isLoading } = useGetStudentLiveStream(courseId);
  const stream = streamResponse?.data;
  const isLive = stream?.status === "live";

  console.log(
    "[LiveClassBanner Rendering] stream data:",
    stream,
    "| isLive:",
    isLive,
  );

  // Socket.io Real-time synchronization
  useEffect(() => {
    if (!courseId) return;

    console.log(
      `[Socket] Initializing connection for LiveClassBanner to ${socketUrl} on room: course:${courseId}`,
    );
    const socket = io(socketUrl, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log(
        `[Socket] Connected perfectly. Emitting ${SOCKET_KEYS.LIVE_STREAM.JOIN} for courseId: ${courseId}`,
      );
      socket.emit(SOCKET_KEYS.LIVE_STREAM.JOIN, courseId);
    });

    socket.on(SOCKET_KEYS.LIVE_STREAM.STATUS_CHANGED, (payload) => {
      console.log("[Socket] 🔴 STATUS_CHANGED Triggered! Payload:", payload);
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.LIVE_STREAMS.STUDENT_ACTIVE, courseId],
      });
    });

    return () => {
      console.log(
        `[Socket] Disconnecting from LiveClassBanner for courseId: ${courseId}`,
      );
      socket.emit(SOCKET_KEYS.LIVE_STREAM.LEAVE, courseId);
      socket.disconnect();
    };
  }, [courseId, queryClient]);

  // If there's no stream assigned to this course at all, don't show the banner
  if (!isLoading && !stream) return null;
  return (
    <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 grid place-items-center">
            <Radio className="w-4.5 h-4.5 text-red-400" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">
            Live Class
          </h3>
          <p className="text-[11px] text-white/30 mt-0.5">
            Join upcoming sessions
          </p>
        </div>
      </div>
      <button
        disabled={!isLive}
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/classroom/batch/${batchId}/live/${stream?._id}`);
        }}
        className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
          isLive
            ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 cursor-pointer"
            : "bg-red-500/10 text-red-400 border border-red-500/20 opacity-50 cursor-not-allowed"
        }`}
      >
        {isLive ? "Join Live" : "Scheduled"}
      </button>
    </div>
  );
};

export default LiveClassBanner;
