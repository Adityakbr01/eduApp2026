"use client";

import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BookOpen,
    ChevronDown,
    ChevronUp,
    Download,
    Globe,
    GraduationCap,
    Play,
    Star
} from "lucide-react";

import formatDuration from "@/lib/utils/formatDuration";
import { ICourse, ISection } from "@/services/courses";



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
    const [openSections, setOpenSections] = useState<{ [key: number]: boolean }>({});
    const [newRating, setNewRating] = useState(0);
    const [newReview, setNewReview] = useState("");
    const [hoveredRating, setHoveredRating] = useState(0);

    const toggleSection = (index: number) => {
        setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    // Get rating stats from course
    const ratingStats = course.ratingStats;
    const averageRating = ratingStats?.averageRating || 0;
    const totalReviews = ratingStats?.totalReviews || 0;

    // Calculate ratings distribution percentages
    const ratingsPercentages = useMemo(() => {
        const distribution = ratingStats?.ratingsDistribution || { one: 0, two: 0, three: 0, four: 0, five: 0 };
        const total = distribution.one + distribution.two + distribution.three + distribution.four + distribution.five;

        return [
            { rating: 5, count: distribution.five, percentage: total > 0 ? ((distribution.five / total) * 100).toFixed(0) : "0" },
            { rating: 4, count: distribution.four, percentage: total > 0 ? ((distribution.four / total) * 100).toFixed(0) : "0" },
            { rating: 3, count: distribution.three, percentage: total > 0 ? ((distribution.three / total) * 100).toFixed(0) : "0" },
            { rating: 2, count: distribution.two, percentage: total > 0 ? ((distribution.two / total) * 100).toFixed(0) : "0" },
            { rating: 1, count: distribution.one, percentage: total > 0 ? ((distribution.one / total) * 100).toFixed(0) : "0" },
        ];
    }, [ratingStats]);

    return (
        <Tabs defaultValue="overview" className="w-full" aria-label="Course information tabs">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
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
                                <p className="font-medium">{totalLessons} Lessons</p>
                                <p className="text-sm text-muted-foreground">{formatDuration(totalDuration)}</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                <GraduationCap className="h-8 w-8 mx-auto mb-2 text-primary" />
                                <p className="font-medium">Certificate</p>
                                <p className="text-sm text-muted-foreground">Of completion</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
                                <p className="font-medium">Lifetime</p>
                                <p className="text-sm text-muted-foreground">Access</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
                                <p className="font-medium">Downloadable</p>
                                <p className="text-sm text-muted-foreground">Resources</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Curriculum Tab */}
            <TabsContent value="curriculum" className="mt-6">
                <div className="space-y-4">
                    {visibleSections.length > 0 ? (
                        visibleSections.map((section, index) => (
                            <Collapsible
                                key={section._id}
                                open={openSections[index]}
                                onOpenChange={() => toggleSection(index)}
                            >
                                <Card className="overflow-hidden">
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <CardTitle className="text-base">
                                                        Section {index + 1}: {section.title}
                                                    </CardTitle>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {section.lessons?.filter(l => l.isVisible).length || 0} lessons
                                                    </p>
                                                </div>
                                                {openSections[index] ? (
                                                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="pt-0 pb-4">
                                            <ul className="space-y-2">
                                                {section.lessons?.filter(l => l.isVisible).map((lesson) => (
                                                    <li
                                                        key={lesson._id}
                                                        className="flex items-center gap-3 text-sm p-2 rounded-md hover:bg-muted/50 transition-colors"
                                                    >
                                                        <Play className="h-4 w-4 text-primary shrink-0" />
                                                        <span>{lesson.title}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            No curriculum available yet.
                        </p>
                    )}
                </div>
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
                <div className="space-y-6">
                    {/* Write Review Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Write a Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-8 w-8 cursor-pointer transition-all hover:scale-110 ${star <= (hoveredRating || newRating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-muted-foreground"
                                                }`}
                                            onClick={() => setNewRating(star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                        />
                                    ))}
                                </div>
                                <Input
                                    placeholder="Write your review here..."
                                    value={newReview}
                                    onChange={(e) => setNewReview(e.target.value)}
                                    className="min-h-25"
                                />
                                <Button disabled={!newRating}>
                                    Submit Review
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reviews Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6 mb-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold">0.0</div>
                                    <div className="flex items-center justify-center gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className="h-4 w-4 text-muted-foreground"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        0 reviews
                                    </p>
                                </div>
                                <div className="flex-1">
                                    {ratingsPercentages.map(({ rating, percentage }) => (
                                        <div key={rating} className="flex items-center gap-2 mb-1">
                                            <span className="text-sm w-3">{rating}</span>
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            <Progress value={parseFloat(percentage)} className="flex-1 h-2" />
                                            <span className="text-sm text-muted-foreground w-10">{percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* No reviews message */}
                            <p className="text-muted-foreground text-center py-4">
                                No reviews yet. Be the first to share your feedback!
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </Tabs>
    );
}


export default CourseTabs;