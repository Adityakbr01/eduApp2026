import CountdownTimer from "@/components/CountdownTimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import formatDuration from "@/lib/utils/formatDuration";
import { ICourse, ISection } from "@/services/courses";
import { Separator } from "@radix-ui/react-select";
import { Bookmark, BookmarkCheck } from "lucide-react";

// Enrollment Card Component
function EnrollmentCard({
    course,
    visibleSections,
    totalLessons,
    totalDuration,
    bookmarked,
    toggleBookmark,
}: {
    course: ICourse;
    visibleSections: ISection[];
    totalLessons: number;
    totalDuration: number;
    bookmarked: boolean;
    toggleBookmark: () => void;
}) {
    const handleEnroll = () => {
        // TODO: Implement enrollment logic
        console.log("Enrolling in course:", course._id);
    };

    return (
        <aside className="lg:col-span-1 h-fit" aria-label="Course enrollment details">
            <div className="sticky top-6">
                <Card className="max-h-[calc(100vh-3rem)] overflow-y-auto">
                    <CardContent className="p-6">
                        {/* Discount Countdown Timer */}
                        {course.pricing?.discountPercentage &&
                            course.pricing.discountPercentage > 0 &&
                            course.pricing.discountExpiresAt && (
                                <div className="mb-4 p-3 rounded-lg bg-linear-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-800">
                                    <CountdownTimer
                                        targetDate={course.pricing.discountExpiresAt}
                                        variant="flip"
                                        showIcon={true}

                                    />
                                </div>
                            )}

                        {/* Price */}
                        <div className="text-center my-6 border-t py-4">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                {course.pricing?.isFree ? (
                                    <span className="text-3xl font-bold text-green-600">Free</span>
                                ) : (
                                    <>
                                        <span className="text-3xl font-bold">
                                            {course.pricing?.currency || "₹"}{course.pricing?.price || 0}
                                        </span>
                                        {course.pricing?.originalPrice && course.pricing.originalPrice > (course.pricing?.price || 0) && (
                                            <span className="text-lg text-muted-foreground line-through">
                                                {course.pricing?.currency || "₹"}{course.pricing.originalPrice}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                            {course.pricing?.discountPercentage && course.pricing.discountPercentage > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                    {course.pricing.discountPercentage}% OFF
                                </Badge>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="space-y-3 mb-6">
                            <Button
                                className="w-full hover:scale-[1.02] transition-transform focus:ring-2 focus:ring-primary"
                                size="lg"
                                onClick={handleEnroll}
                            >
                                Enroll Now
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full hover:scale-[1.02] transition-transform focus:ring-2 focus:ring-primary"
                                onClick={toggleBookmark}
                            >
                                {bookmarked ? (
                                    <>
                                        <BookmarkCheck className="size-4 mr-2" />
                                        Remove from Wishlist
                                    </>
                                ) : (
                                    <>
                                        <Bookmark className="size-4 mr-2" />
                                        Add to Wishlist
                                    </>
                                )}
                            </Button>
                        </div>

                        <Separator className="my-4" />

                        {/* Course Info */}
                        <div className="space-y-3 text-sm">
                            {course.totalEnrollments !== undefined && course.totalEnrollments > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Students:</span>
                                    <span className="font-medium">{course.totalEnrollments.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Sections:</span>
                                <span className="font-medium">{visibleSections.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Lessons:</span>
                                <span className="font-medium">{totalLessons}</span>
                            </div>
                            {course.durationWeeks && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Course Duration:</span>
                                    <span className="font-medium">{course.durationWeeks} week{course.durationWeeks > 1 ? 's' : ''}</span>
                                </div>
                            )}
                            {totalDuration > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Content Duration:</span>
                                    <span className="font-medium">{formatDuration(totalDuration)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Level:</span>
                                <span className="font-medium">{course.level || "All Levels"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Language:</span>
                                <span className="font-medium">{course.language || "English"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Certificate:</span>
                                <span className="font-medium">Yes</span>
                            </div>
                            {course.accessDuration && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Access:</span>
                                    <span className="font-medium">{course.accessDuration} days</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </aside>
    );
}

export default EnrollmentCard;