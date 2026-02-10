"use client";

import { CheckCircle, Headphones } from "lucide-react";

// ========================================================
// AUDIO PLAYER
// ========================================================
function AudioPlayer({
  src,
  contentId,
  marks,
  isCompleted,
}: {
  src: string;
  contentId: string;
  marks: number;
  isCompleted: boolean;
}) {
  return (
    <div className="w-full max-w-lg">
      <div className="bg-dark-card rounded-2xl p-8 border border-white/5 flex flex-col items-center gap-6 shadow-2xl">
        <div className="w-24 h-24 rounded-full bg-primary/10 grid place-items-center">
          <Headphones className="w-10 h-10 text-primary" />
        </div>
        <audio controls src={src} className="w-full" />
        {isCompleted && (
          <p className="flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            Completed
          </p>
        )}
      </div>
    </div>
  );
}

export default AudioPlayer;
