"use client";

import { Video } from "lucide-react";

interface LiveStreamErrorProps {
  batchId: string;
  onBack: () => void;
}

export default function LiveStreamError({
  batchId,
  onBack,
}: LiveStreamErrorProps) {
  return (
    <div className="h-screen bg-black flex items-center justify-center text-white p-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl backdrop-blur-sm">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Video className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold">Stream Unavailable</h2>
        <p className="text-white/50 text-sm">
          This live stream has either ended or is not active yet.
        </p>
        <button
          onClick={onBack}
          className="w-full mt-4 bg-white/10 hover:bg-white/15 text-white font-medium py-2.5 rounded-lg transition-all"
        >
          ← Return to Classroom
        </button>
      </div>
    </div>
  );
}
