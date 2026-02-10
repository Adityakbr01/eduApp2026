"use client";

import { QUERY_KEYS } from "@/config/query-keys";
import { contentProgressApi } from "@/services/classroom/content-progress-api";
import { useQueryClient } from "@tanstack/react-query";
import Hls from "hls.js";
import {
  CheckCircle,
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Settings,
  PictureInPicture2,
  SkipBack,
  SkipForward,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ========================================================
// SAAS VIDEO PLAYER (HLS)
// ========================================================

interface VideoPlayerProps {
  src: string;
  contentId: string;
  courseId: string;
  resumeAt: number;
  minWatchPercent: number;
  marks: number;
  obtainedMarks: number;
  isCompleted: boolean;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function VideoPlayer({
  src,
  contentId,
  courseId,
  resumeAt,
  minWatchPercent,
  marks,
  obtainedMarks,
  isCompleted,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const queryClient = useQueryClient();
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeSaverRef = useRef<NodeJS.Timeout | null>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);

  // State
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [watchedPercent, setWatchedPercent] = useState(0);
  const [autoCompleted, setAutoCompleted] = useState(isCompleted);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);

  // ==================== HLS SETUP ====================
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (resumeAt > 0) video.currentTime = resumeAt;
      });
      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        if (resumeAt > 0) video.currentTime = resumeAt;
      });
    }

    return () => {
      hlsRef.current?.destroy();
      if (resumeSaverRef.current) clearInterval(resumeSaverRef.current);
    };
  }, [src, resumeAt]);

  // ==================== RESUME SAVE (every 10s) ====================
  useEffect(() => {
    resumeSaverRef.current = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused && video.currentTime > 0) {
        contentProgressApi
          .updateResume(contentId, {
            resumeAt: Math.floor(video.currentTime),
            totalDuration: Math.floor(video.duration || 0),
          })
          .catch(() => {});
      }
    }, 10000);

    return () => {
      if (resumeSaverRef.current) clearInterval(resumeSaverRef.current);
    };
  }, [contentId]);

  // ==================== KEYBOARD SHORTCUTS ====================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "arrowleft":
        case "j":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          flashControls();
          break;
        case "arrowright":
        case "l":
          e.preventDefault();
          video.currentTime = Math.min(
            video.duration || 0,
            video.currentTime + 10,
          );
          flashControls();
          break;
        case "arrowup":
          e.preventDefault();
          setVolumeLevel(Math.min(1, volume + 0.1));
          break;
        case "arrowdown":
          e.preventDefault();
          setVolumeLevel(Math.max(0, volume - 0.1));
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [volume, playing]);

  // ==================== FULLSCREEN CHANGE ====================
  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  // ==================== AUTO-HIDE CONTROLS ====================
  const flashControls = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 3000);
  }, []);

  const handleMouseMove = () => flashControls();
  const handleMouseLeave = () => {
    if (playing) {
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 1500);
    }
  };

  // ==================== TIME UPDATE ====================
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);

    // Buffer progress
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      setBuffered(
        video.duration > 0 ? (bufferedEnd / video.duration) * 100 : 0,
      );
    }

    if (video.duration > 0) {
      const pct = (video.currentTime / video.duration) * 100;
      setWatchedPercent(pct);

      // Auto-complete
      if (pct >= minWatchPercent && !autoCompleted) {
        setAutoCompleted(true);
        contentProgressApi
          .markCompleted(contentId, {
            obtainedMarks: marks,
            completionMethod: "auto",
          })
          .then(() => {
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.CLASSROOM.CONTENT(courseId, contentId),
            });
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.CLASSROOM.BATCH(courseId),
            });
          })
          .catch(() => {});
      }
    }
  }, [minWatchPercent, autoCompleted, contentId, courseId, marks, queryClient]);

  // ==================== CONTROLS ====================
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
      flashControls();
    } else {
      video.pause();
      setPlaying(false);
      setShowControls(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const setVolumeLevel = (val: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = val;
    setVolume(val);
    if (val === 0) {
      video.muted = true;
      setMuted(true);
    } else if (muted) {
      video.muted = false;
      setMuted(false);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {}
  };

  const changeSpeed = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !seekBarRef.current) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pct * (video.duration || 0);
  };

  const handleSeekHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!seekBarRef.current) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pct * (duration || 0));
    setHoverX(e.clientX - rect.left);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(
      0,
      Math.min(video.duration || 0, video.currentTime + seconds),
    );
    flashControls();
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-5xl">
      {/* Player Container */}
      <div
        ref={containerRef}
        className="relative bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/50 group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          className="w-full aspect-video cursor-pointer"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => {
            setPlaying(true);
            setIsLoading(false);
          }}
          onPause={() => setPlaying(false)}
          onClick={togglePlay}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onLoadedData={() => setIsLoading(false)}
          playsInline
        />

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        )}

        {/* Big center play button (when paused) */}
        {!playing && !isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 grid place-items-center transition-transform hover:scale-110">
              <Play className="w-7 h-7 text-primary ml-0.5" />
            </div>
          </div>
        )}

        {/* Completion badge overlay */}
        {autoCompleted && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            Completed
          </div>
        )}

        {/* Controls Overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
            showControls
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          {/* Gradient backdrop */}
          <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-12">
            {/* Seek Bar */}
            <div
              ref={seekBarRef}
              className="w-full h-1.5 bg-white/15 rounded-full cursor-pointer mb-3 group/seek hover:h-2.5 transition-all relative"
              onClick={seekTo}
              onMouseMove={handleSeekHover}
              onMouseLeave={() => setHoverTime(null)}
            >
              {/* Buffer progress */}
              <div
                className="absolute inset-y-0 left-0 bg-white/20 rounded-full"
                style={{ width: `${buffered}%` }}
              />

              {/* Watch progress */}
              <div
                className="absolute inset-y-0 left-0 bg-primary rounded-full transition-[width] ease-linear"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Seek thumb */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary rounded-full shadow-lg shadow-primary/40 opacity-0 group-hover/seek:opacity-100 transition-opacity scale-0 group-hover/seek:scale-100" />
              </div>

              {/* Hover time tooltip */}
              {hoverTime !== null && (
                <div
                  className="absolute -top-8 -translate-x-1/2 bg-dark-card/95 text-white text-[10px] font-mono px-2 py-1 rounded-md border border-white/10 shadow-lg pointer-events-none"
                  style={{ left: `${hoverX}px` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-2">
              {/* Left controls */}
              <div className="flex items-center gap-1.5">
                {/* Skip back */}
                <button
                  onClick={() => skip(-10)}
                  className="p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                  title="Rewind 10s (J)"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="p-2 text-white hover:text-primary transition-colors rounded-lg hover:bg-white/10"
                  title="Play/Pause (Space)"
                >
                  {playing ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>

                {/* Skip forward */}
                <button
                  onClick={() => skip(10)}
                  className="p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                  title="Forward 10s (L)"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-1.5 group/vol">
                <button
                  onClick={toggleMute}
                  className="p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                  title="Mute (M)"
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="w-4.5 h-4.5" />
                  ) : (
                    <Volume2 className="w-4.5 h-4.5" />
                  )}
                </button>
                <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-200">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={muted ? 0 : volume}
                    onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                    className="w-full h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-primary"
                  />
                </div>
              </div>

              {/* Time */}
              <span className="text-white/50 text-xs font-mono ml-1">
                {formatTime(currentTime)}
                <span className="text-white/25 mx-1">/</span>
                {formatTime(duration)}
              </span>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Right controls */}
              <div className="flex items-center gap-1">
                {/* Watch progress */}
                {!autoCompleted && (
                  <span className="text-[11px] text-white/30 font-medium mr-1">
                    {Math.round(watchedPercent)}%
                  </span>
                )}

                {/* Speed */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className={`p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10 flex items-center gap-1 ${
                      playbackSpeed !== 1 ? "text-primary" : ""
                    }`}
                    title="Playback Speed"
                  >
                    <Settings className="w-4 h-4" />
                    {playbackSpeed !== 1 && (
                      <span className="text-[10px] font-bold">
                        {playbackSpeed}x
                      </span>
                    )}
                  </button>

                  {/* Speed menu */}
                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-dark-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1.5 min-w-[100px]">
                      {PLAYBACK_SPEEDS.map((speed) => (
                        <button
                          key={speed}
                          onClick={() => changeSpeed(speed)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            playbackSpeed === speed
                              ? "text-primary bg-primary/10"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {speed}x{speed === 1 ? " (Normal)" : ""}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* PiP */}
                <button
                  onClick={togglePiP}
                  className="p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                  title="Picture-in-Picture"
                >
                  <PictureInPicture2 className="w-4 h-4" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                  title="Fullscreen (F)"
                >
                  {isFullscreen ? (
                    <Minimize className="w-4.5 h-4.5" />
                  ) : (
                    <Maximize className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Below player info */}
      <div className="flex items-center justify-between mt-4 px-1">
        {/* Watch requirement */}
        {!autoCompleted && (
          <div className="flex items-center gap-3">
            {/* Progress ring */}
            <div className="relative w-9 h-9">
              <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  className="text-white/10"
                  strokeWidth="2.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  className="text-primary/70"
                  strokeWidth="2.5"
                  strokeDasharray={`${Math.min(watchedPercent, 100) * 0.88} 88`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white/50">
                {Math.round(watchedPercent)}%
              </span>
            </div>
            <div>
              <p className="text-xs text-white/50 font-medium">
                Watch {minWatchPercent}% to complete
              </p>
              <p className="text-[11px] text-white/25">
                Earn {marks} marks on completion
              </p>
            </div>
          </div>
        )}

        {autoCompleted && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-400">
                Completed
              </p>
              <span className="text-xs text-white/40">
                {obtainedMarks}/{marks} marks
              </span>
            </div>
          </div>
        )}

        {/* Keyboard hints */}
        <div className="hidden md:flex items-center gap-2">
          {[
            { key: "Space", label: "Play" },
            { key: "←→", label: "±10s" },
            { key: "M", label: "Mute" },
            { key: "F", label: "Full" },
          ].map((hint) => (
            <div
              key={hint.key}
              className="flex items-center gap-1 text-[10px] text-white/20"
            >
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[9px]">
                {hint.key}
              </kbd>
              <span>{hint.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
