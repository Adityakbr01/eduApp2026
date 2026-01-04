"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BookOpen, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { InstructorStat, CourseInsight, statusConfig } from "./utils";

interface InstructorOverviewProps {
    stats: InstructorStat[];
    recentCourses: CourseInsight[];
    isLoading: boolean;
    onViewAllCourses: () => void;
}

export function InstructorOverview({
    stats,
    recentCourses,
    isLoading,
    onViewAllCourses,
}: InstructorOverviewProps) {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-16 mt-2" />
                            </CardHeader>
                            <CardFooter>
                                <Skeleton className="h-3 w-32" />
                            </CardFooter>
                        </Card>
                    ))
                    : stats.map((stat) => (
                        <Card
                            key={stat.label}
                            className={cn(stat.border, stat.bgColor)}
                        >
                            <CardHeader>
                                <CardDescription>{stat.label}</CardDescription>
                                <CardTitle className="text-3xl font-bold">
                                    {stat.value}
                                </CardTitle>
                            </CardHeader>
                            <CardFooter>
                                <span className="text-sm text-muted-foreground">
                                    {stat.trend}
                                </span>
                            </CardFooter>
                        </Card>
                    ))}
            </section>

            {/* Recent Courses & Quick Actions */}
            <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                {/* Recent Courses */}
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Courses</CardTitle>
                            <CardDescription>
                                Your latest course updates
                            </CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onViewAllCourses}
                            className="gap-1"
                        >
                            View all
                            <ArrowRight className="h-3 w-3" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <Skeleton className="h-10 w-10 rounded" />
                                        <div className="flex-1">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2 mt-1" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-5 w-16" />
                                </div>
                            ))
                        ) : recentCourses.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No courses yet</p>
                                <p className="text-sm">
                                    Create your first course to get started
                                </p>
                            </div>
                        ) : (
                            recentCourses.map((course) => {
                                const status = statusConfig[course.status];
                                return (
                                    <Link
                                        key={course.id}
                                        href={`/dashboard/Instructor/courses/${course.id}/edit`}
                                        className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                                                <BookOpen className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm line-clamp-1">
                                                    {course.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {course.level} • {course.updatedAt}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={status.variant}
                                            className={cn("text-xs", status.className)}
                                        >
                                            {status.label}
                                        </Badge>
                                    </Link>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button asChild className="w-full justify-start gap-2">
                            <Link href="/dashboard/Instructor/courses/create">
                                <Plus className="h-4 w-4" />
                                Create New Course
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={onViewAllCourses}
                        >
                            <BookOpen className="h-4 w-4" />
                            Manage Courses
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
