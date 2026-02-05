"use client";

import { YoutubeVideo } from "@/constants/mock_data";
import Image from "next/image";
import Link from "next/link";

const YoutubeCard = ({ video }: { video: YoutubeVideo }) => {
  return (
    <Link
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        shrink-0
        w-[85vw] sm:w-[70vw] md:w-[32vw]
        p-4 md:p-6
        rounded-xl
        border border-[#4E4A48]
        transition-transform duration-300
        hover:scale-[1.04]
        hover:-translate-y-1
        bg-black/40
        backdrop-blur-xl
        block
      "
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 768px) 85vw, 32vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/60" />

        {/* Play */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
            ▶
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-4 font-manrope">
        <h2 className="text-white text-base md:text-lg font-medium line-clamp-2">
          {video.title}
        </h2>
        <p className="text-sm text-white/60 mt-1">
          {video.views} • {video.likes}
        </p>
      </div>
    </Link>
  );
};

export default YoutubeCard;
