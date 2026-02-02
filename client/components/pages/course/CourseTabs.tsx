"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BookOpen,
    Download,
    GraduationCap,
    Play,
} from "lucide-react";

import { ICourse, ISection } from "@/services/courses";
import ReviewsSection from "./ReviewsSection";
import { formatDuration } from "@/lib/utils/formatDuration";

// Course Tabs Component
function CourseTabs({
    course,
    totalLessons,
    totalDuration,
    visibleSections,
    instructor,
}: {
    course: ICourse;
    totalLessons: number;
    totalDuration: number;
    visibleSections: ISection[];
    instructor: { name?: string; email?: string; profileImage?: string; bio?: string } | null;
}) {
    // Use course.stats from API if available, fallback to calculated values
    const displayLessons = course.stats?.totalLessons ?? totalLessons;
    const displaySections = course.stats?.totalSections ?? visibleSections.length;
    const displayContents = course.stats?.totalContents ?? 0;

    return (
        <Tabs defaultValue="overview" className="w-full" aria-label="Course information tabs">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Course Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {course.description}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                                <p className="font-medium">{displaySections} Sections</p>
                                <p className="text-sm text-muted-foreground">{displayLessons} Lessons</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                <Play className="h-8 w-8 mx-auto mb-2 text-[#04b64e]" />
                                <p className="font-medium">{displayContents} Contents</p>
                                <p className="text-sm text-muted-foreground">{formatDuration(totalDuration)}</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                <GraduationCap className="h-8 w-8 mx-auto mb-2 text-[#0678c4]" />
                                <p className="font-medium">Certificate</p>
                                <p className="text-sm text-muted-foreground">Of completion</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                <Download className="h-8 w-8 mx-auto mb-2 text-[#c40655]" />
                                <p className="font-medium">Downloadable</p>
                                <p className="text-sm text-muted-foreground">Resources</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Instructor Tab */}
            <TabsContent value="instructor" className="mt-6">
                <Card>
                    <CardContent className="pt-6">
                        {instructor ? (
                            <div className="flex items-start gap-4">
                                <Avatar className="h-20 w-20">
                                    {instructor.profileImage ? (
                                        <AvatarImage
                                            src={instructor.profileImage}
                                            alt={`${instructor.name}'s profile picture`}
                                        />
                                    ) : null}
                                    <AvatarFallback className="text-lg">
                                        {instructor.name
                                            ?.split(" ")
                                            .map((n: string) => n[0])
                                            .join("")
                                            .toUpperCase() || "IN"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2">{instructor.name}</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {instructor.email}
                                    </p>
                                    {instructor.bio && (
                                        <p className="text-sm text-muted-foreground">
                                            {instructor.bio}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center">
                                Instructor information not available.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
                <ReviewsSection courseId={course._id} />
            </TabsContent>
        </Tabs>
    );
}

export default CourseTabs;
