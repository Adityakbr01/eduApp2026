"use client";

import { ArrowLeft, BookOpen, Loader2, Save } from "lucide-react";
import Link from "next/link";

// UI components
import { Button } from "@/components/ui/button";

interface CourseHeaderProps {
  isEditing: boolean;
  courseId?: string;
  isLoading: boolean;
  isUploadingThumbnail: boolean;
}

export function CourseHeader({
  isEditing,
  courseId,
  isLoading,
  isUploadingThumbnail,
}: CourseHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
      {/* Title + Back Button */}
      <div className="flex flex-col md:flex-row md:items-center md:gap-4 w-full md:w-auto">
        <Button type="button" variant="ghost" size="icon" asChild>
          <Link href="/dashboard/Instructor">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold leading-snug">
            {isEditing ? "Edit Course" : "Create New Course"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? "Update your course details"
              : "Fill in the details to create a new course"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 w-full md:w-auto gap-2">
        {isEditing && courseId && (
          <Link
            href={`/dashboard/Instructor/courses/${courseId}/curriculum`}
            className="flex items-center gap-2 border border-amber-300 px-4 py-2 rounded-md text-amber-600 hover:bg-amber-50 transition-all text-sm justify-center w-full sm:w-auto"
          >
            <BookOpen className="h-4 w-4" />
            Manage Curriculum
          </Link>
        )}

        <Button
          type="submit"
          disabled={isLoading || isUploadingThumbnail}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isEditing ? "Update Course" : "Create Course"}
        </Button>
      </div>
    </div>
  );
}
