"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { io } from "socket.io-client";

import { SOCKET_KEYS, socketUrl } from "@/constants/SOCKET_IO";
import { useResizePanels } from "@/features/batch/Contents/hooks/useResizePanels";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGetStudentLiveStream } from "@/services/liveStream/queries";

import LiveStreamChat from "../components/LiveStreamChat";
import LiveStreamError from "../components/LiveStreamError";
import LiveStreamHeader from "../components/LiveStreamHeader";
import LiveStreamLoading from "../components/LiveStreamLoading";
import LiveStreamPlayer from "../components/LiveStreamPlayer";
import LiveStreamScheduled from "../components/LiveStreamScheduled";

export default function StudentLiveStreamPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params?.batchId as string;
  const streamId = params?.streamId as string;
  const isMobile = useIsMobile();

  const {
    data: streamResponse,
    isLoading,
    isError,
  } = useGetStudentLiveStream(batchId);
  const stream = streamResponse?.data;

  const [mounted, setMounted] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  // ─── Resize Hook (for collapsible chat panel) ───
  const { leftPanelRef, handleDoubleClick } = useResizePanels();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBack = () => router.push(`/classroom/batch/${batchId}`);

  // ─── Socket.IO: viewer count tracking ───
  useEffect(() => {
    if (!stream || stream.status !== "live") return;

    const courseId = stream.courseId;
    const liveId = stream.liveId;
    if (!courseId || !liveId) return;

    const socket = io(socketUrl, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit(SOCKET_KEYS.LIVE_STREAM.JOIN, { courseId, liveId });
    });

    socket.on(
      SOCKET_KEYS.LIVE_STREAM.VIEWER_COUNT,
      (data: { liveId: string; viewerCount: number }) => {
        if (data.liveId === liveId) {
          setViewerCount(data.viewerCount);
        }
      },
    );

    return () => {
      socket.emit(SOCKET_KEYS.LIVE_STREAM.LEAVE, { courseId, liveId });
      socket.disconnect();
    };
  }, [stream?.courseId, stream?.liveId, stream?.status]);

  if (!mounted) return null;

  if (isLoading) return <LiveStreamLoading />;

  if (isError || !stream || stream._id !== streamId) {
    return <LiveStreamError batchId={batchId} onBack={handleBack} />;
  }

  if (stream.status !== "live") {
    return (
      <LiveStreamScheduled
        title={stream.title}
        scheduledAt={stream.scheduledAt}
        onBack={handleBack}
      />
    );
  }

  // ─── Chat availability ───
  const hasChat = !!stream.chatToken || !!stream.liveId;

  // ─── Stream is LIVE ───
  return (
    <div className="h-screen bg-black flex flex-col font-sans overflow-hidden">
      <LiveStreamHeader
        title={stream.title}
        viewerCount={viewerCount}
        onBack={handleBack}
      />

      {/* ─── Resizable Player & Chat Panels ─── */}
      <main className="flex-1 overflow-hidden p-2 lg:p-4">
        <div className="flex w-full h-full">
          <Group
            orientation={isMobile ? "vertical" : "horizontal"}
            id="live-stream-panels"
          >
            {isMobile ? (
              <>
                {/* Mobile: Player on top */}
                <Panel
                  defaultSize={hasChat ? 65 : 100}
                  minSize={30}
                  id="live-player"
                  className="relative"
                >
                  <LiveStreamPlayer
                    liveId={stream.liveId}
                    chatToken={stream.chatToken}
                  />
                </Panel>

                {hasChat && (
                  <>
                    <Separator className="flex items-center justify-center group h-3 hover:h-4 transition-all relative z-20">
                      <div className="w-12 h-1 bg-white/10 rounded-full group-hover:bg-red-500 group-hover:w-16 group-active:bg-red-500 group-active:w-20 transition-all duration-150 cursor-row-resize" />
                    </Separator>

                    {/* Mobile: Chat on bottom */}
                    <Panel
                      defaultSize={35}
                      minSize={0}
                      id="live-chat"
                      className="relative"
                    >
                      <LiveStreamChat
                        liveId={stream.liveId}
                        chatToken={stream.chatToken}
                      />
                    </Panel>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Desktop: Player on left */}
                <Panel
                  defaultSize={hasChat ? 70 : 100}
                  minSize={30}
                  id="live-player"
                  className="relative"
                >
                  <LiveStreamPlayer
                    liveId={stream.liveId}
                    chatToken={stream.chatToken}
                  />
                </Panel>

                {hasChat && (
                  <>
                    <Separator className="flex items-center justify-center group w-3 hover:w-4 transition-all relative z-20">
                      <div
                        onMouseDown={handleDoubleClick}
                        className="w-1 h-12 bg-white/10 rounded-full group-hover:bg-red-500 group-hover:h-16 group-active:bg-red-500 group-active:h-20 transition-all duration-150 cursor-col-resize"
                      />
                    </Separator>

                    {/* Desktop: Chat on right (collapsible) */}
                    <Panel
                      panelRef={leftPanelRef}
                      defaultSize={30}
                      minSize={0}
                      collapsible
                      collapsedSize={0}
                      id="live-chat"
                      className="relative"
                    >
                      <LiveStreamChat
                        liveId={stream.liveId}
                        chatToken={stream.chatToken}
                      />
                    </Panel>
                  </>
                )}
              </>
            )}
          </Group>
        </div>
      </main>
    </div>
  );
}
