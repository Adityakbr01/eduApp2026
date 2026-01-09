"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import CountdownTimer from "@/components/CountdownTimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import formatDuration from "@/lib/utils/formatDuration";
import { ICourse, ISection } from "@/services/courses";
import {
  useEnrollInFreeCourse,
  useRazorpayPayment,
} from "@/services/enrollment";
import { useAuthStore } from "@/store/auth";
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  Loader2,
  LogIn,
  Play,
} from "lucide-react";

interface EnrollmentCardProps {
  course: ICourse;
  visibleSections: ISection[];
  totalLessons: number;
  totalDuration: number;
  bookmarked: boolean;
  toggleBookmark: () => void;
}

function EnrollmentCard({
  course,
  visibleSections,
  totalLessons,
  totalDuration,
  bookmarked,
  toggleBookmark,
}: EnrollmentCardProps) {
  const router = useRouter();
  const { user, isLoggedIn, hydrated } = useAuthStore();

  const displayLessons = course.stats?.totalLessons ?? totalLessons;
  const displaySections = course.stats?.totalSections ?? visibleSections.length;
  const displayContents = course.stats?.totalContents ?? 0;

  console.log("Enrollment Data:", user);
  const isEnrolled =
    user?.enrolledCourses?.some(
      (enrollment) => enrollment.courseId === course._id
    ) || false;

  // Mutations
  const enrollInFreeCourse = useEnrollInFreeCourse();

  // Razorpay payment hook
  const { initiatePayment, isLoading: isPaymentLoading } = useRazorpayPayment({
    onSuccess: () => {
      toast.success("🎉 Payment successful! Welcome to the course.");
      router.push(`/course/${course.slug || course._id}/learn`);
    },
    onError: (error) => {
      toast.error(error.message || "Payment failed. Please try again.");
    },
    onDismiss: () => {
      toast.error("Payment cancelled. You can try again anytime.");
    },
  });

  // Determine if course is free
  const isFree = course.pricing?.isFree || course.pricing?.price === 0;

  // Handle enrollment
  const handleEnroll = async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      toast("Please log in to enroll in this course.", {
        icon: "🔒",
      });
      router.push(`/auth/login?redirect=/course/${course.slug || course._id}`);
      return;
    }

    try {
      if (isFree) {
        // Direct enrollment for free courses
        await enrollInFreeCourse.mutateAsync(course._id);
        toast.success("🎉 Successfully enrolled! Start learning now.");
        router.push(`/course/${course.slug || course._id}/learn`);
      } else {
        // Initiate Razorpay payment for paid courses
        await initiatePayment(course._id, {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        });
      }
    } catch (error) {
      console.error("Enrollment error:", error);
    }
  };

  // Handle continue learning
  const handleContinueLearning = () => {
    router.push(`/course/${course.slug || course._id}/learn`);
  };

  // Loading states
  const isLoading =
    enrollInFreeCourse.isPending || isPaymentLoading || !hydrated;
  const isButtonDisabled = isLoading || isEnrolled;

  // Render enrollment button based on state
  const renderEnrollButton = () => {
    // Not hydrated yet - show loading
    if (!hydrated) {
      return (
        <Button className="w-full" size="lg" disabled>
          <Loader2 className="size-4 mr-2 animate-spin" />
          Loading...
        </Button>
      );
    }

    // Already enrolled - show continue learning
    if (isEnrolled) {
      return (
        <Button
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
          onClick={handleContinueLearning}
        >
          <Play className="size-4 mr-2" />
          Continue Learning
        </Button>
      );
    }

    // Not logged in
    if (!isLoggedIn) {
      return (
        <Button className="w-full" size="lg" onClick={handleEnroll}>
          <LogIn className="size-4 mr-2" />
          Login to Enroll
        </Button>
      );
    }

    // Logged in but not enrolled
    return (
      <Button
        className="w-full hover:scale-[1.02] transition-transform focus:ring-2 focus:ring-primary"
        size="lg"
        onClick={handleEnroll}
        disabled={isButtonDisabled}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            {isPaymentLoading ? "Processing..." : "Enrolling..."}
          </>
        ) : (
          <>{isFree ? "Enroll for Free" : "Enroll Now"}</>
        )}
      </Button>
    );
  };

  return (
    <aside
      className="lg:col-span-1 h-fit"
      aria-label="Course enrollment details"
    >
      <div className="sticky top-6">
        <Card className="max-h-[calc(100vh-3rem)] overflow-y-auto">
          <CardContent className="p-6">
            {/* Enrolled Badge */}
            {isEnrolled && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 flex items-center gap-2">
                <CheckCircle className="size-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  You are enrolled in this course
                </span>
              </div>
            )}

            {/* Discount Countdown Timer */}
            {!isEnrolled &&
              course.pricing?.discountPercentage &&
              course.pricing.discountPercentage > 0 &&
              course.pricing.discountExpiresAt && (
                <div className="mb-4 flex items-center justify-center   p-3 rounded-lg bg-linear-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-800">
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
                  <span className="text-3xl font-bold text-green-600">
                    Free
                  </span>
                ) : (
                  <>
                    <span className="text-3xl font-bold">
                      {course.pricing?.currency.toLowerCase() === "inr"
                        ? "₹"
                        : course.pricing?.currency}
                      {Math.round(course.pricing?.price || 0) || 0}
                    </span>
                    {course.pricing?.originalPrice &&
                      course.pricing.originalPrice >
                        (Math.round(course.pricing?.price || 0) || 0) && (
                        <span className="text-lg text-muted-foreground line-through">
                          {course.pricing?.currency.toLowerCase() === "inr"
                            ? "₹"
                            : course.pricing?.currency}
                          {course.pricing.originalPrice}
                        </span>
                      )}
                  </>
                )}
              </div>
              {course.pricing?.discountPercentage &&
                course.pricing.discountPercentage > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {course.pricing.discountPercentage}% OFF
                  </Badge>
                )}
            </div>

            {/* Buttons */}
            <div className="space-y-3 mb-6">
              {renderEnrollButton()}

              {!isEnrolled && (
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
              )}
            </div>

            <Separator className="my-4" />

            {/* Course Info */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sections:</span>
                <span className="font-medium">{displaySections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lessons:</span>
                <span className="font-medium">{displayLessons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Contents:</span>
                <span className="font-medium">{displayContents}</span>
              </div>
              {course.durationWeeks && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Course Duration:
                  </span>
                  <span className="font-medium">
                    {course.durationWeeks} week
                    {course.durationWeeks > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {totalDuration > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Content Duration:
                  </span>
                  <span className="font-medium">
                    {formatDuration(totalDuration)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Level:</span>
                <span className="font-medium">
                  {course.level || "All Levels"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language:</span>
                <span className="font-medium">
                  {course.language || "English"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Certificate:</span>
                <span className="font-medium">Yes</span>
              </div>
              {course.accessDuration && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Access:</span>
                  <span className="font-medium">
                    {course.accessDuration} days
                  </span>
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
