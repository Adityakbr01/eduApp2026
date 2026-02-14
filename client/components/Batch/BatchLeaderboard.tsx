"use client";

import { getS3PublicUrl } from "@/app/(routes)/dashboard/Instructor/courses/create/getS3PublicUrl";
import { useGetBatchLeaderboard } from "@/services/classroom/batch-queries";
import { LeaderboardEntry } from "@/services/classroom/batch-types";
import { Trophy } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";

// Local interface for podium items
interface PodiumEntry extends LeaderboardEntry {
  color: string;
  height: string;
  label: string;
}

const BatchLeaderboard = () => {
  const params = useParams();
  // The route param is currently 'batchId' in the student view, but might be 'courseId' in other views.
  const courseId = (params?.courseId || params?.batchId) as string;
  console.log(courseId, "courseId");

  const { data, isLoading } = useGetBatchLeaderboard(courseId);
  console.log(data, "data");

  // Extract data safely
  const leaderboard = data?.data?.list || [];
  const currentUser = data?.data?.currentUser || null;

  // Top 3 for podium
  const topThree = leaderboard.slice(0, 3);
  // Rest for list
  const list = leaderboard.slice(3);

  // Prepare podium order: 2nd, 1st, 3rd
  // We need to be careful if fewer than 3 users exist
  const podiumMap = {
    0: { color: "bg-[#9ECBFE]", height: "h-32 md:h-44", label: "1st" }, // Rank 1
    1: { color: "bg-[#FFE47A]", height: "h-24 md:h-36", label: "2nd" }, // Rank 2
    2: { color: "bg-[#FFC6B4]", height: "h-20 md:h-28", label: "3rd" }, // Rank 3
  };

  // Construct podium array safely
  const podiumItems: any[] = [];
  if (topThree.length > 0) {
    // We want order: [Rank 2, Rank 1, Rank 3]
    // If we have index 1 (Rank 2), put it first
    if (topThree[1]) podiumItems.push({ ...topThree[1], ...podiumMap[1] });
    // Rank 1 is always first in topThree array, but middle in podium
    if (topThree[0]) podiumItems.push({ ...topThree[0], ...podiumMap[0] });
    // Rank 3
    if (topThree[2]) podiumItems.push({ ...topThree[2], ...podiumMap[2] });
  }

  if (isLoading) {
    return (
      <div className="bg-dark-card rounded-2xl border border-white/5 flex flex-col w-full h-full animate-pulse p-6">
        <div className="h-6 w-32 bg-white/5 rounded mb-8" />
        <div className="flex justify-center items-end gap-4 mb-8">
          <div className="h-24 w-16 bg-white/5 rounded-t-lg" />
          <div className="h-32 w-16 bg-white/5 rounded-t-lg" />
          <div className="h-20 w-16 bg-white/5 rounded-t-lg" />
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
      <div className="flex items-center gap-3 px-6 py-4 bg-dark-extra-light border-b border-white/5 shadow-md z-10">
        <div className="p-1.5 bg-primary/10 rounded-lg">
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-primary">Leaderboard</h2>
      </div>

      {/* Content */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Podium */}
        <div className="flex justify-center items-end gap-2 sm:gap-4 px-4 pt-8 pb-0 shrink-0">
          {podiumItems.map((user: PodiumEntry) => (
            <div
              key={user.userId}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary/50 transition-colors">
                  <Image
                    src={
                      getS3PublicUrl(user.avatar?.key) ||
                      `https://ui-avatars.com/api/?name=${user.name}&background=random`
                    }
                    alt={user.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-[10px] px-2 rounded-full border border-white/10 text-white/80 whitespace-nowrap max-w-[80px] truncate">
                  {user.name}
                </div>
              </div>

              <div
                className={`w-16 sm:w-24 ${user.height} ${user.color} rounded-t-lg flex flex-col justify-between items-center py-2 text-black shadow-lg`}
              >
                <div className="font-bold text-xl opacity-50">{user.label}</div>
                <div className="bg-white/30 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-bold text-black/80">
                  {user.points >= 1000
                    ? `${(user.points / 1000).toFixed(1)}k`
                    : user.points}
                </div>
              </div>
            </div>
          ))}
          {podiumItems.length === 0 && (
            <div className="text-white/40 text-sm py-10">No rankings yet</div>
          )}
        </div>

        {/* List Header */}
        <div className="grid grid-cols-12 gap-2 text-xs font-bold text-white/40 uppercase tracking-wider px-6 py-3 bg-[#232323] border-b border-white/5">
          <div className="col-span-6 max-w-[120px]">Name</div>
          <div className="col-span-3 text-center">Rank</div>
          <div className="col-span-3 text-right">Points</div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#232323] px-2 pb-20">
          {list.map((user: LeaderboardEntry, index: number) => (
            <div
              key={user.userId}
              className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors rounded-lg group"
            >
              <div className="col-span-6 flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                  <Image
                    src={
                      user.avatar?.url ||
                      `https://ui-avatars.com/api/?name=${user.name}&background=random`
                    }
                    alt={user.name}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-white/80 group-hover:text-white line-clamp-1">
                  {user.name}
                </span>
              </div>
              <div className="col-span-3 text-center">
                <span className="bg-white/5 text-white/60 text-xs font-bold px-2 py-1 rounded">
                  #{index + 4}
                </span>
              </div>
              <div className="col-span-3 text-right text-sm font-bold text-primary">
                {user.points >= 1000
                  ? `${(user.points / 1000).toFixed(1)}k`
                  : user.points}
              </div>
            </div>
          ))}
        </div>

        {/* Footer User Stats */}
        {currentUser && (
          <div className="absolute bottom-0 left-0 w-full bg-dark-card border-t border-white/10 p-4 shadow-2xl shadow-black">
            <p className="text-center text-sm text-white/60">
              You are ahead of{" "}
              <span className="font-bold text-emerald-400">
                {currentUser.percentile}%
              </span>{" "}
              of students.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchLeaderboard;
