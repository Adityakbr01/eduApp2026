"use client";

import { ICourse, CourseStatus } from "@/services/courses";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { statusConfig } from "./utils";
import { getS3PublicUrl } from "@/app/(routes)/dashboard/Instructor/courses/create/getS3PublicUrl";

interface CourseCardProps {
  course: ICourse;
  submitCourseRequest: (
    id: string,
    type: CourseStatus.PUBLISHED | CourseStatus.UNPUBLISHED
  ) => void;
  onDelete?: (id: string) => void;
}

export function CourseCard({
  course,
  submitCourseRequest,
  onDelete,
}: CourseCardProps) {
  const status =
    statusConfig[course.status] || statusConfig[CourseStatus.DRAFT];

  // ✅ Convert S3 key → Public URL
  const coverImageUrl = getS3PublicUrl(course.thumbnail?.key || "");

  return (
    <Card className="pt-0 overflow-hidden hover:shadow-md transition-shadow">
      {/* 🖼 Cover Image */}
      <div className="relative h-40 bg-muted">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="size-12 text-muted-foreground" />
          </div>
        )}

        <Badge className="absolute top-2 right-2" variant={status.variant}>
          {status.label}
        </Badge>
      </div>

      {/* 📌 Header */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2">
            {course.title}
          </CardTitle>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/Instructor/courses/${course._id}/edit`}>
                  <Edit className="size-4 mr-2" />
                  Edit Course
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/Instructor/courses/${course._id}/curriculum`}
                >
                  <BookOpen className="size-4 mr-2" />
                  Manage Curriculum
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {course.status === CourseStatus.DRAFT ||
              course.status === CourseStatus.REJECTED ? (
                <DropdownMenuItem
                  onClick={() =>
                    submitCourseRequest(course._id, CourseStatus.PUBLISHED)
                  }
                >
                  <Eye className="size-4 mr-2" />
                  Submit for Review
                </DropdownMenuItem>
              ) : course.status === CourseStatus.PUBLISHED ? (
                <DropdownMenuItem
                  onClick={() =>
                    submitCourseRequest(course._id, CourseStatus.UNPUBLISHED)
                  }
                >
                  <EyeOff className="size-4 mr-2" />
                  Request Unpublish
                </DropdownMenuItem>
              ) : course.status === CourseStatus.PENDING_REVIEW ? (
                <DropdownMenuItem disabled>
                  <Clock className="size-4 mr-2" />
                  Pending Approval
                </DropdownMenuItem>
              ) : null}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete?.(course._id)}
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* 📄 Content */}
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.shortDescription || course.description}
        </p>
      </CardContent>

      {/* 📎 Footer */}
      <CardFooter className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{course.level}</span>
        <span>{course.language}</span>
      </CardFooter>
    </Card>
  );
}
