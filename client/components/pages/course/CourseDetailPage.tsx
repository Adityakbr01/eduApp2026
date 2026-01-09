"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    BookOpen,
    ChevronLeft,
    Clock,
    Globe,
    Users
} from "lucide-react";

import calculateCourseStats from "@/lib/utils/calculateCourseStats";
import formatDuration from "@/lib/utils/formatDuration";
import { useGetPublishedCourseById } from "@/services/courses";
import CourseDetailSkeleton from "./CourseDetailSkeleton";
import CourseMedia from "./CourseMedia";
import CourseTabs from "./CourseTabs";
import EnrollmentCard from "./EnrollmentCard";

interface CourseDetailPageProps {
    slug: string;
}






export function CourseDetailPage({ slug }: CourseDetailPageProps) {
    const router = useRouter();
    const { data: courseData, isLoading, error } = useGetPublishedCourseById(slug);
    const [bookmarked, setBookmarked] = useState(false);

    const course = courseData?.data;
    const toggleBookmark = () => setBookmarked(!bookmarked);

    if (isLoading) {
        return <CourseDetailSkeleton />;
    }

    if (error || !course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <BookOpen className="size-16 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
                <p className="text-muted-foreground mb-4">
                    The course you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <Button onClick={() => router.push('/courses')}>
                    <ChevronLeft className="size-4 mr-2" />
                    Browse Courses
                </Button>
            </div>
        );
    }

    const categoryName = typeof course.category === 'object' ? course.category.name : '';
    const instructor = typeof course.instructor === 'object' ? course.instructor : null;
    const language = course.language || 'English';
    const level = course.level || 'All Levels';
    const { totalLessons, totalDuration } = calculateCourseStats(course.sections);
    const visibleSections = course.sections?.filter((s: { isVisible: boolean }) => s.isVisible) || [];

    return (
        <div className="min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-muted/30 border-b">
                <div className="container mx-auto px-4 md:px-16 py-3">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/courses" className="hover:text-foreground transition-colors">
                            Courses
                        </Link>
                        <span>/</span>
                        {categoryName && (
                            <>
                                <span>{categoryName}</span>
                                <span>/</span>
                            </>
                        )}
                        <span className="text-foreground truncate max-w-50">
                            {course.title}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 md:px-16 py-8">
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column - Scrollable Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Back Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.history.back()}
                            aria-label="Go back to courses list"
                            className="focus:ring-2 focus:ring-primary group cursor-pointer"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Courses
                        </Button>

                        {/* Course Header */}
                        <div className="space-y-4">
                            {/* Level & Language Badges */}
                            <div className="flex items-center gap-2">
                                <Badge variant="default">{level}</Badge>
                                <Badge variant="outline">{language}</Badge>

                            </div>

                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                                {course.title}
                            </h1>

                            <p className="text-lg text-muted-foreground">
                                {course.shortDescription || course.description?.slice(0, 200)}
                            </p>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                                {instructor && (
                                    <div className="flex items-center gap-2">
                                        <Users className="size-4" />
                                        <span>By {instructor.name}</span>
                                    </div>
                                )}
                                {totalDuration > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="size-4 text-amber-500" />
                                        <span>{formatDuration(totalDuration)}</span>
                                    </div>
                                )}
                                {course.updatedAt && (
                                    <div className="flex items-center gap-2">
                                        <Globe className="size-4 text-blue-500" />
                                        <span>Last updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                )}

                                {course.stats && course.stats.totalEnrollments > 0 && (
                                    <Badge className="flex justify-between shadow-none" variant={"destructive"}>
                                        <span className="text-muted-foreground">Enrolled Students: </span>
                                        <span className="font-medium">
                                            {course.stats.totalEnrollments.toLocaleString()}
                                        </span>
                                    </Badge>
                                )}
                            </div>

                            {/* Tags */}
                            {course.tags && course.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {course.tags.map((tag: string) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Course Media */}
                        <CourseMedia
                            course={course}
                            bookmarked={bookmarked}
                            toggleBookmark={toggleBookmark}
                        />

                        {/* Course Tabs */}
                        <CourseTabs
                            course={course}
                            totalLessons={totalLessons}
                            totalDuration={totalDuration}
                            visibleSections={visibleSections}
                            instructor={instructor}
                        />
                    </div>

                    {/* Right Column - Sticky Enrollment Card */}
                    <EnrollmentCard
                        visibleSections={visibleSections}
                        course={course}
                        totalLessons={totalLessons}
                        totalDuration={totalDuration}
                        bookmarked={bookmarked}
                        toggleBookmark={toggleBookmark}
                    />
                </div>
            </div>
        </div>
    );
}
