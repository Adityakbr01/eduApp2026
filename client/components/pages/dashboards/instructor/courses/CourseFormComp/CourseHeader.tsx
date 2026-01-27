"use client";

import { ArrowLeft, BookOpen, Loader2, Save } from "lucide-react";
import Link from "next/link";

// UI components
import { Button } from "@/components/ui/button";

// ────────────────────────────────────────────────
// Header + Actions
// ────────────────────────────────────────────────
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" size="icon" asChild>
          <Link href="/dashboard/Instructor">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Course" : "Create New Course"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update your course details"
              : "Fill in the details to create a new course"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isEditing && courseId && (
          <Link
            href={`/dashboard/Instructor/courses/${courseId}/curriculum`}
            className="flex items-center gap-2 border border-t border-b-amber-300 px-4 py-1 rounded-md text-amber-600 hover:bg-amber-50 transition-all"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Manage Curriculum
          </Link>
        )}

        <Button
          type="submit"
          disabled={isLoading || isUploadingThumbnail}
          className="cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isEditing ? "Update Course" : "Create Course"}
        </Button>
      </div>
    </div>
  );
}