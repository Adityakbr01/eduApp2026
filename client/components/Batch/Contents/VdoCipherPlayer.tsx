"use client";

import { useEffect, useRef, useState } from "react";
import { useMarkContentCompleted } from "@/services/classroom";
import { contentProgressApi } from "@/services/classroom/content-progress-api";

interface Props {
  batchId: string;
  lessonContentId: string;
  lessonContent: {
    resumeAt?: number;
    minWatchPercent?: number;
    marks?: number;
    isCompleted?: boolean;
  };
}

declare global {
  interface Window {
    VdoPlayer: {
      getInstance: (iframe: HTMLIFrameElement) => any;
    };
    onVdoPlayerV2APIReady?: () => void;
  }
}

export default function VdoCipherPlayer({
  batchId,
  lessonContentId,
  lessonContent,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const lastSavedTimeRef = useRef<number>(-1);
  const hasResumedRef = useRef(false);
  const hasMarkedCompleteRef = useRef(false);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiReady, setApiReady] = useState(false);

  const { mutateAsync: markCompleted } = useMarkContentCompleted(
    batchId,
    lessonContentId,
  );

  // ===============================
  // Load VdoCipher API Script
  // ===============================
  useEffect(() => {
    if (
      document.querySelector('script[src*="player.vdocipher.com/v2/api.js"]')
    ) {
      setApiReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://player.vdocipher.com/v2/api.js";
    script.async = true;

    script.onload = () => {
      setApiReady(true);
    };

    window.onVdoPlayerV2APIReady = () => {
      setApiReady(true);
    };

    document.body.appendChild(script);

    return () => {
      const scriptElement = document.querySelector(
        'script[src*="player.vdocipher.com/v2/api.js"]',
      );
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, []);

  // ===============================
  // Load OTP + Build iframe
  // ===============================
  useEffect(() => {
    const loadVideo = async () => {
      try {
        setLoading(true);

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

        // 🔥 Production-safe URL builder
        const apiUrl =
          process.env.NODE_ENV === "production"
            ? `${baseUrl.replace(/\/$/, "")}/videos/${lessonContentId}/play`
            : `${baseUrl}videos/${lessonContentId}/play`;

        const res = await fetch(apiUrl, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();
        const data = json.data;

        if (!data?.otp || !data?.playbackInfo) {
          throw new Error("Invalid playback credentials");
        }

        const src = `https://player.vdocipher.com/v2/?otp=${data.otp}&playbackInfo=${data.playbackInfo}&autoplay=true`;

        setIframeSrc(src);
      } catch (err) {
        console.error("Failed to load video:", err);
        setLoading(false);
      }
    };

    if (lessonContentId) {
      loadVideo();
    }
  }, [lessonContentId]);

  // ===============================
  // Save Progress Helper
  // ===============================
  const saveProgress = async (currentTime: number, duration: number) => {
    const currentSecond = Math.floor(currentTime);

    // Only save if time has actually changed
    if (currentSecond === lastSavedTimeRef.current) return;

    lastSavedTimeRef.current = currentSecond;

    console.log(
      "💾 Saving progress:",
      currentSecond,
      "/",
      Math.floor(duration),
      "seconds",
    );

    try {
      await contentProgressApi.updateResume(lessonContentId, {
        resumeAt: currentSecond,
        totalDuration: Math.floor(duration),
      });
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  };

  // ===============================
  // Initialize Player + Setup Events
  // ===============================
  useEffect(() => {
    if (!apiReady || !iframeSrc || !iframeRef.current) return;

    const timer = setTimeout(() => {
      if (!iframeRef.current || !window.VdoPlayer) return;

      try {
        const player = window.VdoPlayer.getInstance(iframeRef.current);
        playerRef.current = player;

        console.log("✅ VdoCipher player initialized");

        // 🎯 LOADEDDATA EVENT - When video data is loaded
        const loadedDataHandler = async () => {
          if (hasResumedRef.current) return;
          hasResumedRef.current = true;

          try {
            const resumeTime = lessonContent.resumeAt || 0;
            const duration = await player.video.duration;

            console.log(
              "📺 Video loaded | Duration:",
              Math.floor(duration),
              "sec | Resume:",
              resumeTime,
              "sec",
            );

            // Calculate safe resume position
            const minResumeTime = 2; // Don't resume before 2 seconds
            const endBuffer = 5; // Don't resume within 5 seconds of end
            const maxResumeTime = Math.max(0, duration - endBuffer);

            if (resumeTime > minResumeTime && resumeTime < maxResumeTime) {
              // Valid resume position
              player.video.currentTime = resumeTime;
              console.log("⏩ Resumed at:", resumeTime, "seconds");

              await player.video.play();
              console.log("▶️ Playing from resume position");
            } else if (resumeTime >= maxResumeTime) {
              // Too close to end, restart from beginning
              console.log("🔄 Resume too close to end, restarting");
              player.video.currentTime = 0;
            } else {
              // Start from beginning (resumeTime <= minResumeTime)
              console.log("▶️ Starting from beginning");
            }

            setLoading(false);
          } catch (err) {
            console.error("Error in loadedDataHandler:", err);
            setLoading(false);
          }
        };

        // 🎯 PLAYING EVENT - Video started playing
        const playingHandler = async () => {
          console.log("▶️ Video is now playing");

          // Start periodic save every 4 seconds
          if (!saveIntervalRef.current) {
            saveIntervalRef.current = setInterval(async () => {
              try {
                const currentTime = await player.video.currentTime;
                const duration = await player.video.duration;

                if (currentTime && duration) {
                  await saveProgress(currentTime, duration);
                }
              } catch (err) {
                console.error("Error in save interval:", err);
              }
            }, 4000); // Save every 4 seconds
          }
        };

        // 🎯 PAUSE EVENT - User paused
        const pauseHandler = async () => {
          try {
            const currentTime = await player.video.currentTime;
            const duration = await player.video.duration;

            console.log("⏸️ Paused at:", Math.floor(currentTime), "seconds");

            // Clear interval when paused
            if (saveIntervalRef.current) {
              clearInterval(saveIntervalRef.current);
              saveIntervalRef.current = null;
            }

            // Save immediately on pause
            await saveProgress(currentTime, duration);
          } catch (err) {
            console.error("Error in pauseHandler:", err);
          }
        };

        // 🎯 SEEKING EVENT - User is seeking
        const seekingHandler = () => {
          console.log("🔍 Seeking...");
        };

        // 🎯 SEEKED EVENT - Seek completed
        const seekedHandler = async () => {
          try {
            const currentTime = await player.video.currentTime;
            console.log("✅ Seeked to:", Math.floor(currentTime), "seconds");
          } catch (err) {
            console.error("Error in seekedHandler:", err);
          }
        };

        // 🎯 TIME UPDATE - Monitor progress and auto-complete
        const timeUpdateHandler = async () => {
          try {
            const currentTime = await player.video.currentTime;
            const duration = await player.video.duration;

            if (!duration || currentTime === undefined) return;

            // =====================
            // AUTO COMPLETE
            // =====================
            if (!hasMarkedCompleteRef.current && !lessonContent.isCompleted) {
              const percent = (currentTime / duration) * 100;
              const requiredPercent = lessonContent.minWatchPercent || 80;

              if (percent >= requiredPercent) {
                hasMarkedCompleteRef.current = true;

                console.log(
                  "✅ Auto-completing at",
                  percent.toFixed(1),
                  "% (required:",
                  requiredPercent,
                  "%)",
                );

                try {
                  await markCompleted({
                    obtainedMarks: lessonContent.marks || 100,
                    completionMethod: "auto",
                  });
                } catch (err) {
                  console.error("Failed to mark complete:", err);
                  hasMarkedCompleteRef.current = false; // Retry on next update
                }
              }
            }
          } catch (err) {
            console.error("Error in timeUpdateHandler:", err);
          }
        };

        // 🎯 ENDED EVENT - Video finished
        const endedHandler = async () => {
          console.log("🏁 Video ended");

          // Clear interval
          if (saveIntervalRef.current) {
            clearInterval(saveIntervalRef.current);
            saveIntervalRef.current = null;
          }

          try {
            const duration = await player.video.duration;

            // Save final position
            await saveProgress(duration, duration);

            // Ensure completion is marked
            if (!hasMarkedCompleteRef.current && !lessonContent.isCompleted) {
              hasMarkedCompleteRef.current = true;

              console.log("✅ Marking complete on video end");

              await markCompleted({
                obtainedMarks: lessonContent.marks || 100,
                completionMethod: "auto",
              });
            }
          } catch (err) {
            console.error("Error in endedHandler:", err);
          }
        };

        // 🎯 ERROR EVENT - Player error
        const errorHandler = (error: any) => {
          console.error("❌ Player error:", error);
          setLoading(false);
        };

        // Attach all listeners
        player.video.addEventListener("loadeddata", loadedDataHandler);
        player.video.addEventListener("playing", playingHandler);
        player.video.addEventListener("pause", pauseHandler);
        player.video.addEventListener("seeking", seekingHandler);
        player.video.addEventListener("seeked", seekedHandler);
        player.video.addEventListener("timeupdate", timeUpdateHandler);
        player.video.addEventListener("ended", endedHandler);
        player.video.addEventListener("error", errorHandler);

        // Cleanup
        return () => {
          player.video.removeEventListener("loadeddata", loadedDataHandler);
          player.video.removeEventListener("playing", playingHandler);
          player.video.removeEventListener("pause", pauseHandler);
          player.video.removeEventListener("seeking", seekingHandler);
          player.video.removeEventListener("seeked", seekedHandler);
          player.video.removeEventListener("timeupdate", timeUpdateHandler);
          player.video.removeEventListener("ended", endedHandler);
          player.video.removeEventListener("error", errorHandler);

          // Clear save interval
          if (saveIntervalRef.current) {
            clearInterval(saveIntervalRef.current);
            saveIntervalRef.current = null;
          }
        };
      } catch (err) {
        console.error("Error initializing player:", err);
        setLoading(false);
      }
    }, 2000);

    return () => {
      clearTimeout(timer);

      // Clear save interval on unmount
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
    };
  }, [apiReady, iframeSrc, lessonContentId, lessonContent, markCompleted]);

  return (
    <div className="w-full h-full">
      <div className="relative w-full h-full min-h-[200px] overflow-hidden bg-black">
        {iframeSrc && (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            allow="encrypted-media; autoplay; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
            <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
