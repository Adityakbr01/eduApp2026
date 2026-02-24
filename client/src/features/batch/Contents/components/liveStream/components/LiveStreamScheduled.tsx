"use client";

import { Video } from "lucide-react";

interface LiveStreamScheduledProps {
  title: string;
  scheduledAt?: string | null;
  onBack: () => void;
}

export default function LiveStreamScheduled({
  title,
  scheduledAt,
  onBack,
}: LiveStreamScheduledProps) {
  return (
    <div className="h-screen bg-black flex items-center justify-center text-white p-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl backdrop-blur-sm">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
          <Video className="w-10 h-10 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-white/50 text-sm">
          This stream is scheduled and will go live soon. Please wait for the
          instructor to start streaming.
        </p>
        {scheduledAt && (
          <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/70">
            Scheduled for{" "}
            <span className="text-white font-medium">
              {new Date(scheduledAt).toLocaleString()}
            </span>
          </div>
        )}
        <button
          onClick={onBack}
          className="w-full bg-white/10 hover:bg-white/15 text-white font-medium py-2.5 rounded-lg transition-all"
        >
          ← Return to Classroom
        </button>
      </div>
    </div>
  );
}
