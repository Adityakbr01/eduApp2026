"use client";

import { Bookmark } from "lucide-react";

const BatchBookmarks = () => {
  return (
    <div className="bg-dark-card rounded-2xl border border-white/5 w-full h-full flex flex-col p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
        <div className="p-2 bg-emerald-400/10 rounded-lg">
          <Bookmark className="w-5 h-5 text-emerald-400" />
        </div>
        <h2 className="text-lg font-bold text-white">Your Bookmarks</h2>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 text-white/30 gap-3">
        <Bookmark className="w-12 h-12 opacity-20" />
        <p>No bookmarks yet.</p>
        <p className="text-xs max-w-[200px] text-center">
          Bookmark lessons or resources to quickly access them here.
        </p>
      </div>
    </div>
  );
};

export default BatchBookmarks;
