"use client";

import { Trophy } from "lucide-react";
import Image from "next/image";

// Mock Data for Leaderboard
const TOP_THREE = [
  {
    name: "Shama",
    rank: 1,
    points: "19.83k",
    image:
      "https://lh3.googleusercontent.com/a/ACg8ocJDwq6cmRxw-luSdpthe0dc2Phn32hw41NSR_Kb5vTR3e2h3g=s96-c",
    color: "bg-[#9ECBFE]",
    height: "h-32 md:h-44",
  },
  {
    name: "Bhavya",
    rank: 2,
    points: "16.04k",
    image:
      "https://lh3.googleusercontent.com/a/ACg8ocJlKuHuNFRKvOe5dC1XNXqYvZkMXu29oyBiu7tYDEnsvkixWvEI=s96-c",
    color: "bg-[#FFE47A]",
    height: "h-24 md:h-36",
  },
  {
    name: "Arshdeep",
    rank: 3,
    points: "15.79k",
    image:
      "https://lh3.googleusercontent.com/a/ACg8ocL8CER84m4Fez9EzLIK1lCL4DmFq_9I63Jv9m0xdI9czgBHspyJ=s96-c",
    color: "bg-[#FFC6B4]",
    height: "h-20 md:h-28",
  },
];

const LEADERBOARD_LIST = [
  {
    rank: 4,
    name: "Devesh Gupta",
    points: "15.15k",
    image:
      "https://lh3.googleusercontent.com/a/ACg8ocKT0z47yllmwNFu627qQxm5bmdXyMECD-hx9OYy7SuCfLyBio97=s96-c",
  },
  {
    rank: 5,
    name: "Bilal Shaikj",
    points: "14.11k",
    image:
      "https://lh3.googleusercontent.com/a/ACg8ocIB5DpfTdiMkgr5J6Jx-GAeATnUBPB7TiR7mfj9wVo2kbqybw=s96-c",
  },
  {
    rank: 6,
    name: "Saksham Walia",
    points: "13.28k",
    image:
      "https://lh3.googleusercontent.com/a/ACg8ocKXqdnekAy5oQLQJQwJ19vDoSg_LhraMU6dJns8plcXXEJsPhzd8A=s96-c",
  },
  {
    rank: 7,
    name: "Nilesh Shakhya",
    points: "13.1k",
    image:
      "https://lh3.googleusercontent.com/a/ACg8ocI3aJou_UiZlKfIEr1bIAFaQ2lOfi4XqnWtKCYwMXC-594I6pkE=s96-c",
  },
  {
    rank: 8,
    name: "Prakhar Mehrotra",
    points: "13.02k",
    image:
      "https://lh3.googleusercontent.com/a/ACg8ocLw-mNPFvx2-DhArS-waPc6eMsEoXTHLMpj1N0mwApBKSzwNg=s96-c",
  },
  {
    rank: 9,
    name: "Sujal Rajput",
    points: "11.55k",
    image:
      "https://lh3.googleusercontent.com/a/ACg8ocIj0ViL2WtDO_gzxJ60nyxniOvDbkgXDXZdVqE2xUjEJrDkdMMSIw=s96-c",
  },
  // ... add more if needed
];

const BatchLeaderboard = () => {
  // Reorder for visual podium: 2, 1, 3
  const podiumOrder = [TOP_THREE[1], TOP_THREE[0], TOP_THREE[2]];

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
          {podiumOrder.map((user, index) => (
            <div
              key={user.name}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary/50 transition-colors">
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-[10px] px-2 rounded-full border border-white/10 text-white/80">
                  {user.name}
                </div>
              </div>

              <div
                className={`w-16 sm:w-24 ${user.height} ${user.color} rounded-t-lg flex flex-col justify-between items-center py-2 text-black shadow-lg`}
              >
                <div className="font-bold text-xl opacity-50">
                  {index === 1 ? "1st" : index === 0 ? "2nd" : "3rd"}
                </div>
                <div className="bg-white/30 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-bold text-black/80">
                  {user.points}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* List Header */}
        <div className="grid grid-cols-12 gap-2 text-xs font-bold text-white/40 uppercase tracking-wider px-6 py-3 bg-[#232323] border-b border-white/5">
          <div className="col-span-6">Name</div>
          <div className="col-span-3 text-center">Rank</div>
          <div className="col-span-3 text-right">Points</div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#232323] px-2 pb-20">
          {LEADERBOARD_LIST.map((user) => (
            <div
              key={user.rank}
              className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors rounded-lg group"
            >
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                  <Image
                    src={user.image}
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
                  #{user.rank}
                </span>
              </div>
              <div className="col-span-3 text-right text-sm font-bold text-primary">
                {user.points}
              </div>
            </div>
          ))}
        </div>

        {/* Footer User Stats */}
        <div className="absolute bottom-0 left-0 w-full bg-dark-card border-t border-white/10 p-4 shadow-2xl shadow-black">
          <p className="text-center text-sm text-white/60">
            You are ahead of{" "}
            <span className="font-bold text-emerald-400">85.95%</span> of
            students.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BatchLeaderboard;
