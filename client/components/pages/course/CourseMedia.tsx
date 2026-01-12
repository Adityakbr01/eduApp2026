"use client";

import { getS3PublicUrl } from "@/app/(routes)/dashboard/Instructor/courses/create/getS3PublicUrl";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, BookOpen, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

function CourseMedia({
  course,
  bookmarked,
  toggleBookmark,
}: {
  course: {
    title: string;
    coverImage?: string;
    previewVideoUrl?: string;
  };
  bookmarked: boolean;
  toggleBookmark: () => void;
}) {
  const [showPlayer, setShowPlayer] = useState(false);

  // ✅ Convert S3 key → public URL
  const coverImageUrl = getS3PublicUrl(course.coverImage);

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden group w-full bg-muted">
      {showPlayer && course.previewVideoUrl ? (
        <video
          src={course.previewVideoUrl}
          controls
          autoPlay
          className="w-full h-full object-cover"
        />
      ) : (
        <>
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={`${course.title} course thumbnail`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-linear-to-br from-primary/20 to-primary/5">
              <BookOpen className="size-20 text-muted-foreground" />
            </div>
          )}

          {/* ▶ Overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {course.previewVideoUrl && (
              <Button
                size="lg"
                className="bg-white/90 text-black hover:bg-white hover:scale-105 transition-transform focus:ring-2 focus:ring-primary"
                aria-label="Watch course demo video"
                onClick={() => setShowPlayer(true)}
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            )}
          </div>

          {/* 🔖 Bookmark Button */}
          <button
            onClick={toggleBookmark}
            className="absolute bottom-4 right-4 bg-amber-500 hover:bg-amber-600 cursor-pointer p-2 rounded-full shadow-md transition-all hover:scale-110 active:scale-95"
            aria-label={
              bookmarked ? "Remove from bookmarks" : "Add to bookmarks"
            }
          >
            {bookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </>
      )}
    </div>
  );
}

export default CourseMedia;
