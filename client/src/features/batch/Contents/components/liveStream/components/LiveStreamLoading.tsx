"use client";

import { Loader2 } from "lucide-react";

export default function LiveStreamLoading() {
  return (
    <div className="h-screen bg-black flex items-center justify-center text-white/50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-red-500" />
        <p className="text-sm font-medium">Connecting to live classroom...</p>
      </div>
    </div>
  );
}
