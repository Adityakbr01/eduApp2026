import { getS3PublicUrl } from "@/app/(routes)/dashboard/Instructor/courses/create/getS3PublicUrl";
import { LeaderboardEntry } from "@/services/classroom/batch-types";
import Image from "next/image";

interface LeaderboardListProps {
  list: LeaderboardEntry[];
}

const LeaderboardList = ({ list }: LeaderboardListProps) => {
  return (
    <>
      {/* List Header */}
      <div className="grid grid-cols-12 gap-2 -mt-4 z-30 text-xs font-bold text-white/50 uppercase tracking-wider px-6 py-3 bg-linear-to-r from-[#232323] to-[#1a1a1a] border-y border-white/5 relative shadow-lg">
        <div className="col-span-6">Name</div>
        <div className="col-span-3 text-center">Rank</div>
        <div className="col-span-3 text-right">Points</div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#232323] px-2 pb-20">
        {list.map((user, index) => (
          <div
            key={user.userId}
            className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-all duration-200 rounded-lg group cursor-pointer"
          >
            <div className="col-span-6 flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary/30 transition-colors shrink-0 shadow-lg">
                <Image
                  src={
                    getS3PublicUrl(user.avatar?.url) ||
                    getS3PublicUrl(user.avatar?.key) ||
                    `https://ui-avatars.com/api/?name=${user.name}&background=random`
                  }
                  alt={user.name}
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors line-clamp-1">
                {user.name}
              </span>
            </div>
            <div className="col-span-3 text-center">
              <span className="bg-linear-to-br from-white/10 to-white/5 text-white/70 text-xs font-bold px-2.5 py-1 rounded-md group-hover:from-primary/20 group-hover:to-primary/10 group-hover:text-primary transition-all">
                #{index + 4}
              </span>
            </div>
            <div className="col-span-3 text-right">
              <span className="text-sm font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {user.points >= 1000
                  ? `${(user.points / 1000).toFixed(1)}k`
                  : user.points}
              </span>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-center text-white/30 text-xs py-8">
            Start competing to appear on the leaderboard!
          </div>
        )}
      </div>
    </>
  );
};

export default LeaderboardList;
