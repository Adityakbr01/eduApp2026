import { getS3PublicUrl } from "@/app/(routes)/dashboard/Instructor/courses/create/getS3PublicUrl";
import { LeaderboardEntry } from "@/services/classroom/batch-types";
import { Award, Crown, Medal } from "lucide-react";
import Image from "next/image";
import { PODIUM_STYLES } from "./leaderboard.constants";

interface PodiumProps {
  podiumItems: (LeaderboardEntry & { position: number })[];
}

const Podium = ({ podiumItems }: PodiumProps) => {
  return (
    <div className="flex justify-center items-end gap-3 sm:gap-6 px-4 pt-8 pb-4 shrink-0 relative">
      {/* Decorative background rays */}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-radial from-primary/20 via-transparent to-transparent blur-3xl" />
      </div>

      {podiumItems.map((user, idx) => {
        const style =
          PODIUM_STYLES[(user.position - 1) as keyof typeof PODIUM_STYLES];
        const isFirst = user.position === 1;
        const Icon = isFirst ? Crown : user.position === 2 ? Award : Medal;

        if (!style) return null;

        return (
          <div
            key={user.userId}
            className={`flex flex-col items-center gap-3 group relative z-10 ${
              isFirst ? "scale-105" : ""
            } animate-fadeInUp`}
            style={{
              animationDelay: `${idx * 0.1}s`,
            }}
          >
            {/* Crown/Medal Icon */}
            <div className={`mb-1 ${isFirst ? "animate-bounce" : ""}`}>
              <Icon
                className={`w-5 h-5 sm:w-6 sm:h-6 ${style.crownColor} drop-shadow-lg`}
              />
            </div>

            {/* Avatar with premium styling */}
            <div className="relative">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-3 ${style.ringColor} ring-4 ${style.ringColor} group-hover:ring-8 transition-all duration-300 ${style.glowColor} shadow-2xl relative z-10 bg-dark-card`}
              >
                <Image
                  src={
                    getS3PublicUrl(user.avatar?.url) ||
                    getS3PublicUrl(user.avatar?.key) ||
                    `https://ui-avatars.com/api/?name=${user.name}&background=random`
                  }
                  alt={user.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Rank badge */}
              <div
                className={`absolute -top-1 z-10 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-linear-to-br ${style.gradientFrom} ${style.gradientTo} flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg ring-2 ring-black/20`}
              >
                {user.position}
              </div>

              {/* Name tag */}
              <div className="absolute z-20 -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-[10px] sm:text-xs px-3 py-1 rounded-full border border-white/20 text-white/90 whitespace-nowrap max-w-[100px] sm:max-w-[120px] truncate shadow-xl">
                {user.name}
              </div>
            </div>

            {/* Premium Podium Column */}
            <div
              className={`w-20 sm:w-28 md:w-32 ${style.height} bg-linear-to-b ${style.gradientFrom} ${style.gradientTo} rounded-t-2xl flex flex-col
               justify-between items-center py-3 sm:py-4 text-white shadow-2xl ${style.glowColor} relative overflow-hidden group-hover:shadow-3xl 
               transition-all duration-300`}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-linear-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
              </div>

              {/* Position label */}
              <div className="font-black text-2xl sm:text-3xl opacity-60 relative z-10 drop-shadow-lg">
                {style.label}
              </div>

              {/* Points badge - Premium Style */}
              <div className="bg-[linear-gradient(140deg,rgba(0,0,0,0.4),transparent)] border border-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-full text-sm sm:text-base font-bold text-white shadow-lg relative z-10 transition-transform duration-300">
                <span className="drop-shadow-md">
                  {user.points >= 1000
                    ? `${(user.points / 1000).toFixed(1)}k`
                    : user.points}
                </span>
                <span className="text-[10px] ml-1 opacity-80 font-medium">
                  pts
                </span>
              </div>
            </div>
          </div>
        );
      })}
      {podiumItems.length === 0 && (
        <div className="text-white/40 text-sm py-10">No rankings yet</div>
      )}
    </div>
  );
};

export default Podium;
