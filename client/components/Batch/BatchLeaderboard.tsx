"use client";

import { QUERY_KEYS } from "@/config/query-keys";
import { SOCKET_KEYS, socketUrl } from "@/constants/SOCKET_IO";
import { useGetBatchLeaderboard } from "@/services/classroom/batch-queries";
import { useQueryClient } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { io } from "socket.io-client";
import LeaderboardList from "./Leaderboard/LeaderboardList";
import Podium from "./Leaderboard/Podium";
import UserStats from "./Leaderboard/UserStats";

const BatchLeaderboard = () => {
  const params = useParams();
  const courseId = (params?.courseId || params?.batchId) as string;

  const { data, isLoading } = useGetBatchLeaderboard(courseId);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!courseId) return;

    const socket = io(socketUrl, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log(`✅ Connected to socket: ${socket.id}`);
      socket.emit(SOCKET_KEYS.LEADERBOARD_UPDATE.JOIN, courseId);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
    });

    socket.on(SOCKET_KEYS.LEADERBOARD_UPDATE.UPDATE, (data: any) => {
      console.log("Leaderboard update received:", data);
      if (data.courseId === courseId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CLASSROOM.LEADERBOARD(courseId),
        });
      }
    });

    return () => {
      socket.off(SOCKET_KEYS.LEADERBOARD_UPDATE.UPDATE);
      socket.emit(SOCKET_KEYS.LEADERBOARD_UPDATE.LEAVE, courseId);
      socket.disconnect();
    };
  }, [courseId, queryClient]);

  // Extract data safely
  const leaderboard = data?.data?.list || [];
  const currentUser = data?.data?.currentUser || null;

  // Top 3 for podium
  const topThree = leaderboard.slice(0, 3);
  // Rest for list
  const list = leaderboard.slice(3);

  // Construct podium array: [2nd, 1st, 3rd]
  const podiumItems: any[] = [];
  if (topThree.length > 0) {
    if (topThree[1]) podiumItems.push({ ...topThree[1], position: 2 });
    if (topThree[0]) podiumItems.push({ ...topThree[0], position: 1 });
    if (topThree[2]) podiumItems.push({ ...topThree[2], position: 3 });
  }

  if (isLoading) {
    return (
      <div className="bg-dark-card rounded-2xl border border-white/5 flex flex-col w-full h-full animate-pulse p-6">
        <div className="h-6 w-32 bg-white/5 rounded mb-8" />
        <div className="flex justify-center items-end gap-4 mb-8">
          <div className="h-24 w-20 bg-white/5 rounded-t-lg" />
          <div className="h-32 w-20 bg-white/5 rounded-t-lg" />
          <div className="h-20 w-20 bg-white/5 rounded-t-lg" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-white/5 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-card rounded-2xl border border-white/5 flex flex-col w-full h-full overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-white/5 shadow-md z-10">
        <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Leaderboard
        </h2>
      </div>

      {/* Content */}
      <div className="flex flex-col h-full overflow-hidden">
        <Podium podiumItems={podiumItems} />
        <LeaderboardList list={list} />
        <UserStats currentUser={currentUser} />
      </div>
    </div>
  );
};

export default BatchLeaderboard;
