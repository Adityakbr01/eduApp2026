"use client";

import { ICourse, CourseStatus } from "@/services/courses";
import { CourseCard } from "./CourseCard";
import { CourseListSkeleton } from "./CourseListSkeleton";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";

interface CoursesSectionProps {
    courses: ICourse[];
    isLoading: boolean;
    searchQuery: string;
    filterStatus: string | null;
    setFilterStatus: (status: string | null) => void;
    onPublish: (id: string) => void;
    onUnpublish: (id: string) => void;
    onDelete: (id: string) => void;
}

const statusOptions = [
    { value: "all", label: "All Status" },
    { value: CourseStatus.DRAFT, label: "Draft" },
    { value: CourseStatus.PUBLISHED, label: "Published" },
    { value: CourseStatus.PENDING_REVIEW, label: "Pending Review" },
    { value: CourseStatus.ARCHIVED, label: "Archived" },
];

export function CoursesSection({
    courses,
    isLoading,
    searchQuery,
    filterStatus,
    setFilterStatus,
    onPublish,
    onUnpublish,
    onDelete,
}: CoursesSectionProps) {
    // Filter courses
    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            searchQuery.trim() === "" ||
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            !filterStatus || filterStatus === "all" || course.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-end">
                    <div className="w-40 h-9 bg-muted rounded animate-pulse" />
                </div>
                <CourseListSkeleton count={6} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                    {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
                    {searchQuery && ` matching "${searchQuery}"`}
                </p>
                <Select
                    value={filterStatus || "all"}
                    onValueChange={(value) =>
                        setFilterStatus(value === "all" ? null : value)
                    }
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Course Grid or Empty State */}
            {filteredCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/20">
                    <BookOpen className="size-16 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">
                        {searchQuery || filterStatus
                            ? "No courses found"
                            : "No courses yet"}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {searchQuery || filterStatus
                            ? "Try adjusting your search or filters"
                            : "Create your first course to start teaching"}
                    </p>
                    {!searchQuery && !filterStatus && (
                        <Button asChild>
                            <Link href="/dashboard/Instructor/courses/create">
                                <Plus className="size-4 mr-2" />
                                Create Your First Course
                            </Link>
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <CourseCard
                            key={course._id}
                            course={course}
                            onPublish={onPublish}
                            onUnpublish={onUnpublish}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
