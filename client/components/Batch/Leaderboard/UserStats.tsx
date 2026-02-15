import { Trophy } from "lucide-react";

interface UserStatsProps {
  currentUser: {
    rank: number;
    points: number;
    percentile: number;
  } | null;
}

const UserStats = ({ currentUser }: UserStatsProps) => {
  if (!currentUser) return null;

  return (
    <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-dark-card via-dark-card to-transparent border-t border-white/10 p-4 shadow-2xl backdrop-blur-sm z-40">
      <div className="flex items-center justify-center gap-2">
        <Trophy className="w-4 h-4 text-emerald-400" />
        <p className="text-center text-sm text-white/70">
          You are ahead of{" "}
          <span className="font-black text-emerald-400 text-base">
            {currentUser.percentile}%
          </span>{" "}
          of students
        </p>
      </div>
    </div>
  );
};

export default UserStats;
