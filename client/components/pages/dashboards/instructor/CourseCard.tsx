"use client";

import { ICourse, CourseStatus } from "@/services/courses";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Eye, EyeOff, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import links from "@/constants/links";

interface CourseCardProps {
    course: ICourse;
    onPublish?: (id: string) => void;
    onUnpublish?: (id: string) => void;
    onDelete?: (id: string) => void;
}

const statusConfig: Record<CourseStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    [CourseStatus.DRAFT]: { label: "Draft", variant: "secondary" },
    [CourseStatus.PENDING_REVIEW]: { label: "Pending", variant: "outline" },
    [CourseStatus.PUBLISHED]: { label: "Published", variant: "default" },
    [CourseStatus.ARCHIVED]: { label: "Archived", variant: "secondary" },
    [CourseStatus.REJECTED]: { label: "Rejected", variant: "destructive" },
};

export function CourseCard({ course, onPublish, onUnpublish, onDelete }: CourseCardProps) {
    const status = statusConfig[course.status] || statusConfig[CourseStatus.DRAFT];

    return (
        <Card className=" pt-0 overflow-hidden hover:shadow-md transition-shadow">
            {/* Cover Image */}
            <div className="relative h-40 bg-muted">
                {course.coverImage ? (
                    <Image
                        src={links.S3.S3_BASE_URL + course.coverImage}
                        alt={course.title}
                        fill
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

            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">{course.title}</CardTitle>
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
                                <Link href={`/dashboard/Instructor/courses/${course._id}/curriculum`}>
                                    <BookOpen className="size-4 mr-2" />
                                    Manage Curriculum
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {course.isPublished ? (
                                <DropdownMenuItem onClick={() => onUnpublish?.(course._id)}>
                                    <EyeOff className="size-4 mr-2" />
                                    Unpublish
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => onPublish?.(course._id)}>
                                    <Eye className="size-4 mr-2" />
                                    Publish
                                </DropdownMenuItem>
                            )}
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

            <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.shortDescription || course.description}
                </p>
            </CardContent>

            <CardFooter className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{course.level}</span>
                <span>{course.language}</span>
            </CardFooter>
        </Card>
    );
}
