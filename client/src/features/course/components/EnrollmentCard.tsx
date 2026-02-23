"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import CountdownTimer from "@/components/CountdownTimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PAYMENT_MESSAGES } from "@/config/razorpay.config";
import { formatDuration } from "@/lib/utils/formatDuration";
import { ICourse, ISection } from "@/services/courses";
import { useValidateCoupon } from "@/services/courses/mutations";
import { useEnrollInFreeCourse } from "@/services/enrollment";
import { useRazorpayPayment } from "@/services/payment";
import { useAuthStore } from "@/store/auth";
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  Loader2,
  LogIn,
  Play,
  Ticket,
  X,
} from "lucide-react";
import { useState } from "react";

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
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  console.log("Course Stats:", course);

  const displayLessons = course.stats?.totalLessons ?? totalLessons;
  const displaySections = course.stats?.totalSections ?? visibleSections.length;
  const displayContents = course.stats?.totalContents ?? 0;

  console.log("My Enrollment Data:", user);
  const isEnrolled =
    user?.enrolledCourses?.some(
      (enrollment) => enrollment.courseId === course._id,
    ) || false;

  // Mutations
  const enrollInFreeCourse = useEnrollInFreeCourse();
  const validateCoupon = useValidateCoupon();

  // Razorpay payment hook
  const { initiatePayment, isLoading: isPaymentLoading } = useRazorpayPayment({
    onSuccess: () => {
      toast.success(PAYMENT_MESSAGES.success.title);
      router.push(`/classroom/batch/${course._id}`);
    },
    onError: (error) => {
      toast.error(error.message || PAYMENT_MESSAGES.failed.description);
    },
    onDismiss: () => {
      toast.error(PAYMENT_MESSAGES.cancelled.description);
    },
  });

  // Determine if course is free
  const isFree = course.pricing?.isFree || course.pricing?.price === 0;

  const originalPrice =
    Math.round(course.pricing?.originalPrice || course.pricing?.price || 0) ||
    0;
  const currentPrice = Math.round(course.pricing?.price || 0) || 0;
  const isCouponActive = appliedCoupon !== null;
  const finalPrice = isCouponActive
    ? Math.round(appliedCoupon.finalPrice)
    : currentPrice;
  const totalSaved = originalPrice - finalPrice;

  // Handle enrollment
  const handleEnroll = async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      toast("Please log in to enroll in this course.", {
        icon: "🔒",
      });
      router.push(`/signin?redirect=/course/${course.slug || course._id}`);
      return;
    }

    if (isEnrolled) {
      toast.success("You are already enrolled in this course.");
      router.push(`/classroom/batch/${course._id}`);
      return;
    }

    try {
      if (isFree) {
        // Direct enrollment for free courses
        await enrollInFreeCourse.mutateAsync(course._id);
        toast.success("🎉 Successfully enrolled! Start learning now.");
        router.push(`/classroom/batch/${course._id}`);
      } else {
        // Initiate Razorpay payment for paid courses
        console.log("Initiating payment for course:", {
          courseId: course._id,
          userId: user?.id,
          amount: finalPrice,
          couponCode: appliedCoupon?.code,
        });
        await initiatePayment(
          course._id,
          {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.phone || "",
          },
          appliedCoupon?.code,
        );
      }
    } catch (error) {
      console.error("Enrollment error:", error);
    }
  };

  // Handle continue learning
  const handleContinueLearning = () => {
    router.push(`/classroom/batch/${course._id}`);
  };

  // Loading states
  const isLoading =
    enrollInFreeCourse.isPending ||
    isPaymentLoading ||
    validateCoupon.isPending ||
    !hydrated;
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
            <div className="text-center mt-6 mb-2 border-t pt-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                {isFree ? (
                  <span className="text-3xl font-bold text-green-600">
                    Free
                  </span>
                ) : (
                  <>
                    <span className="text-3xl font-bold">
                      {course.pricing?.currency.toLowerCase() === "inr"
                        ? "₹"
                        : course.pricing?.currency}
                      {finalPrice}
                    </span>
                    {originalPrice > currentPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        {course.pricing?.currency.toLowerCase() === "inr"
                          ? "₹"
                          : course.pricing?.currency}
                        {originalPrice}
                      </span>
                    )}
                  </>
                )}
              </div>
              {course.pricing?.discountPercentage &&
                course.pricing.discountPercentage > 0 && (
                  <Badge variant="destructive" className="text-xs mb-2">
                    {course.pricing.discountPercentage}% OFF
                  </Badge>
                )}
            </div>

            {/* Price Breakdown (If coupon or discount active) */}
            {!isFree &&
              !isEnrolled &&
              (originalPrice > currentPrice || isCouponActive) && (
                <div className="mb-4 p-3 bg-muted/30 rounded-lg text-sm space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Original Price:</span>
                    <span>₹{originalPrice}</span>
                  </div>
                  {originalPrice > currentPrice && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Course Discount:</span>
                      <span>-₹{originalPrice - currentPrice}</span>
                    </div>
                  )}
                  {isCouponActive && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-500 font-medium">
                      <span>Coupon Applied ({appliedCoupon.code}):</span>
                      <span>-₹{currentPrice - finalPrice}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Final Price:</span>
                    <span>₹{finalPrice}</span>
                  </div>
                  {totalSaved > 0 && (
                    <div className="text-center text-xs text-emerald-600 dark:text-emerald-500 font-medium pt-1 mt-2 bg-emerald-50 dark:bg-emerald-950/20 py-1.5 rounded">
                      You saved ₹{totalSaved} 🎉
                    </div>
                  )}
                </div>
              )}

            {/* Coupon Section */}
            {!isFree && !isEnrolled && (
              <div className="mb-6 px-1">
                {isCouponActive ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Ticket className="size-4 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 leading-none mb-1">
                          {appliedCoupon.code} applied!
                        </p>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80 leading-none">
                          You saved ₹{currentPrice - finalPrice}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:hover:bg-emerald-900"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode("");
                        toast.success("Coupon removed.");
                      }}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter Coupon Code"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 uppercase"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      disabled={validateCoupon.isPending}
                    />
                    <Button
                      size="sm"
                      disabled={!couponCode.trim() || validateCoupon.isPending}
                      onClick={async () => {
                        try {
                          const res = await validateCoupon.mutateAsync({
                            code: couponCode,
                            courseId: course._id,
                          });
                          if (res.success && res.data) {
                            setAppliedCoupon({
                              code: couponCode,
                              finalPrice: res.data.finalPrice,
                            });
                          }
                        } catch (err) {
                          // error is handled in mutation hook
                        }
                      }}
                    >
                      {validateCoupon.isPending ? "Applying..." : "Apply"}
                    </Button>
                  </div>
                )}
              </div>
            )}

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
