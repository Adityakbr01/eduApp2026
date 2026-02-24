"use client";

import { useRef, useState, useCallback } from "react";

interface LiveStreamPlayerProps {
  liveId: string;
  chatToken?: string | null;
}

type PlayerStatus = "loading" | "playing" | "error" | "ended";

export default function LiveStreamPlayer({
  liveId,
  chatToken,
}: LiveStreamPlayerProps) {
  const [status, setStatus] = useState<PlayerStatus>("loading");
  const [iframeKey, setIframeKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Official VdoCipher live player URL ────────────────────────────────────
  const playerSrc = chatToken
    ? `https://player.vdocipher.com/live-v2?liveId=${liveId}&token=${chatToken}`
    : `https://player.vdocipher.com/live-v2?liveId=${liveId}`;

  // Optimistic: remove loading overlay after 6s if no error fires.
  const startOptimisticTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setStatus((prev) => (prev === "loading" ? "playing" : prev));
    }, 6000);
  }, []);

  const handleRetry = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("loading");
    setIframeKey((k) => k + 1);
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <iframe
        key={`player-${iframeKey}`}
        src={playerSrc}
        allow="encrypted-media; autoplay; fullscreen"
        allowFullScreen
        frameBorder={0}
        onLoad={startOptimisticTimer}
        onError={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          setStatus("error");
        }}
        className={`absolute inset-0 w-full h-full border-0 ${status !== "playing" ? "invisible" : ""}`}
        title="Live Stream"
      />

      {/* ── Status overlay ──────────────────────────────────────────────── */}
      {status !== "playing" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center px-8 max-w-sm">
            {status === "loading" && (
              <>
                <span className="text-5xl">📡</span>
                <p className="text-white font-semibold text-base">
                  Connecting to live stream...
                </p>
                <p className="text-white/50 text-sm">Please wait a moment.</p>
                <div className="flex gap-1.5 mt-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <span className="text-5xl">❌</span>
                <p className="text-white font-semibold text-base">
                  Stream unavailable
                </p>
                <p className="text-white/50 text-sm">
                  The stream may not be broadcasting yet, or has ended.
                </p>
                <button
                  onClick={handleRetry}
                  className="mt-2 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-colors cursor-pointer"
                >
                  Try again
                </button>
              </>
            )}

            {status === "ended" && (
              <>
                <span className="text-5xl">🎬</span>
                <p className="text-white font-semibold text-base">
                  Stream has ended
                </p>
                <p className="text-white/50 text-sm">
                  A recording may be available soon.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
