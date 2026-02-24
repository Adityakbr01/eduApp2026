"use client";

import { ArrowLeft, Users } from "lucide-react";

interface LiveStreamHeaderProps {
  title: string;
  viewerCount: number;
  onBack: () => void;
}

export default function LiveStreamHeader({
  title,
  viewerCount,
  onBack,
}: LiveStreamHeaderProps) {
  return (
    <header className="shrink-0 h-14 border-b border-white/5 bg-black/90 backdrop-blur-md flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full text-white/60 transition-colors"
          title="Leave Live Class"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          {/* Live Indicator */}
          <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 px-2.5 py-1 rounded-full">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-red-400 text-xs font-bold uppercase tracking-wider">
              Live
            </span>
          </div>

          <div className="flex flex-col">
            <h1 className="text-white font-semibold text-sm leading-tight line-clamp-1">
              {title}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Users className="w-3 h-3" />
              <span>{viewerCount} watching</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
