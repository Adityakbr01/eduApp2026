"use client";

import { Radio } from "lucide-react";

const LiveClassBanner = () => {
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
        disabled
        className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-bold uppercase tracking-widest opacity-50 cursor-not-allowed"
      >
        Join Live
      </button>
    </div>
  );
};

export default LiveClassBanner;
