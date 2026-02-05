"use client";

import { CommunityItem } from "@/constants/mock_data";
import { MoveUpRight, Play, Pause } from "lucide-react";
import Image from "next/image";
import { useRef, useEffect } from "react";
import { useVideoContext } from "./context/VideoContext";

interface CommunityCardProps {
  item: CommunityItem;
  className?: string;
}

const CommunityCard = ({ item, className = "" }: CommunityCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { currentPlayingId, setCurrentPlayingId } = useVideoContext();

  const isPlaying = currentPlayingId === item.id;

  // Pause this video when another video starts playing
  useEffect(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  const handleVideoToggle = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      // Pause this video
      setCurrentPlayingId(null);
    } else {
      // Play this video (will auto-pause others via context)
      setCurrentPlayingId(item.id);
    }
  };

  if (item.type === "video") {
    return (
      <div
        className={`rounded-xl group text-white relative overflow-hidden bg-black/10 ${className}`}
      >
        <div className="w-full h-full relative">
          <video
            ref={videoRef}
            preload="metadata"
            className="object-cover object-center w-full h-full outline-none"
            style={{ objectPosition: item.objectPosition }}
            poster={item.poster}
            src={item.src}
            playsInline
            loop
          >
            <track kind="captions" label="English" />
          </video>

          {/* Play/Pause Button */}
          <button
            onClick={handleVideoToggle}
            className={`
              absolute inset-0 flex items-center justify-center 
              bg-black/20 transition-opacity duration-300 ease-in-out
              ${isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"}
            `}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            <div className="w-16 h-16 sm:w-17 sm:h-17 rounded-full cursor-pointer border border-white flex items-center justify-center transition-transform duration-200 hover:scale-110">
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-white text-white" />
              ) : (
                <Play className="w-6 h-6 fill-white text-white ml-1" />
              )}
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Image Card
  return (
    <div
      className={`rounded-xl group text-white relative overflow-hidden bg-black/10 ${className}`}
    >
      <Image
        src={item.src}
        alt={item.title || "Community image"}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-all duration-300 ease-in-out lg:group-hover:grayscale"
        style={{ objectPosition: item.objectPosition }}
      />

      {/* Hover Overlay with Title & Description (Desktop only) */}
      {item.title && (
        <div
          className="
            absolute hidden lg:flex bottom-0 
            group-hover:translate-y-0 transition-all duration-500 translate-y-full 
            left-0 bg-linear-to-b from-transparent to-[#E8602E] 
            pt-10 min-h-[30%] w-full z-10
          "
        >
          <div className="p-6 lg:p-8 h-max mt-auto">
            <h3 className="font-machina font-extrabold capitalize text-xl lg:text-2xl xl:text-3xl">
              {item.title}
            </h3>
            <p className="text-white/90 text-sm lg:text-base xl:text-lg mt-2">
              {item.description}
            </p>
          </div>
        </div>
      )}

      {/* Arrow Icon */}
      {item.title && (
        <div
          className="
            absolute flex items-center justify-center 
            top-3 right-3 sm:top-5 sm:right-5 
            p-3 sm:p-4 lg:p-[1em]
            bg-[#010101] backdrop-blur-md rounded-full
            group-hover:rotate-45 transition-all duration-700
          "
        >
          <MoveUpRight className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
        </div>
      )}
    </div>
  );
};

export default CommunityCard;
