"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface VideoContextType {
  currentPlayingId: number | null;
  setCurrentPlayingId: (id: number | null) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null);

  return (
    <VideoContext.Provider value={{ currentPlayingId, setCurrentPlayingId }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideoContext() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideoContext must be used within a VideoProvider");
  }
  return context;
}
