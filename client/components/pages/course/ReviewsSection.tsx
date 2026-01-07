"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertCircle,
    CheckCircle,
    Edit2,
    Flag,
    Loader2,
    MessageSquare,
    Star,
    ThumbsDown,
    ThumbsUp,
    Trash2,
} from "lucide-react";

import { useAuthStore } from "@/store/auth";
import {
    useGetCourseReviews,
    useGetMyReview,
    useCreateReview,
    useUpdateReview,
    useDeleteReview,
    useVoteReview,
    IReview,
    IReviewUser,
    ReviewSortBy,
} from "@/services/reviews";
import { useCheckEnrollmentStatus } from "@/services/enrollment";

interface ReviewsSectionProps {
    courseId: string;
}

export function ReviewsSection({ courseId }: ReviewsSectionProps) {
    const { isLoggedIn, hydrated } = useAuthStore();

    // State for review form
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [sortBy, setSortBy] = useState<ReviewSortBy>("recent");

    // Queries
    const { data: reviewsData, isLoading: isLoadingReviews } = useGetCourseReviews(
        courseId,
        { sortBy, limit: 10 },
        true
    );

    const { data: myReviewData } = useGetMyReview(
        courseId,
        isLoggedIn && hydrated
    );

    const { data: enrollmentData } = useCheckEnrollmentStatus(
        courseId,
        isLoggedIn && hydrated
    );

    // Mutations
    const createReview = useCreateReview(courseId);
    const updateReview = useUpdateReview(courseId);
    const deleteReview = useDeleteReview(courseId);
    const voteReview = useVoteReview(courseId);

    const reviews = reviewsData?.data?.reviews || [];
    const ratingSummary = reviewsData?.data?.ratingSummary;
    const myReview = myReviewData?.data?.review;
    const isEnrolled = enrollmentData?.data?.isEnrolled || false;

    // Calculate ratings percentages
    const ratingsPercentages = [
        { rating: 5, count: ratingSummary?.ratingsDistribution?.five || 0 },
        { rating: 4, count: ratingSummary?.ratingsDistribution?.four || 0 },
        { rating: 3, count: ratingSummary?.ratingsDistribution?.three || 0 },
        { rating: 2, count: ratingSummary?.ratingsDistribution?.two || 0 },
        { rating: 1, count: ratingSummary?.ratingsDistribution?.one || 0 },
    ].map((item) => {
        const total = ratingSummary?.totalReviews || 0;
        return {
            ...item,
            percentage: total > 0 ? ((item.count / total) * 100).toFixed(0) : "0",
        };
    });

    // Handle submit review
    const handleSubmitReview = async () => {
        if (!rating) {
            toast.error("Please select a rating");
            return;
        }
        if (content.length < 10) {
            toast.error("Review must be at least 10 characters");
            return;
        }

        try {
            if (isEditing && myReview) {
                await updateReview.mutateAsync({
                    reviewId: myReview._id,
                    data: { rating, title: title || undefined, content },
                });
                toast.success("Review updated successfully!");
            } else {
                await createReview.mutateAsync({
                    rating,
                    title: title || undefined,
                    content,
                });
                toast.success("Review submitted successfully!");
            }

            // Reset form
            setRating(0);
            setTitle("");
            setContent("");
            setIsEditing(false);
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Failed to submit review";
            toast.error(message);
        }
    };

    // Handle edit review
    const handleEditReview = () => {
        if (myReview) {
            setRating(myReview.rating);
            setTitle(myReview.title || "");
            setContent(myReview.content);
            setIsEditing(true);
        }
    };

    // Handle delete review
    const handleDeleteReview = async () => {
        if (!myReview) return;

        if (!confirm("Are you sure you want to delete your review?")) return;

        try {
            await deleteReview.mutateAsync(myReview._id);
            toast.success("Review deleted successfully!");
            setRating(0);
            setTitle("");
            setContent("");
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Failed to delete review";
            toast.error(message);
        }
    };

    // Handle vote
    const handleVote = async (reviewId: string, voteType: "helpful" | "not_helpful") => {
        if (!isLoggedIn) {
            toast.error("Please login to vote");
            return;
        }

        try {
            await voteReview.mutateAsync({ reviewId, data: { voteType } });
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Failed to vote";
            toast.error(message);
        }
    };

    // Render star rating
    const renderStars = (value: number, size: "sm" | "md" | "lg" = "md") => {
        const sizeClasses = {
            sm: "h-3 w-3",
            md: "h-4 w-4",
            lg: "h-5 w-5",
        };

        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${sizeClasses[size]} ${star <= value
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                            }`}
                    />
                ))}
            </div>
        );
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Get user info from review
    const getReviewUser = (review: IReview): IReviewUser | null => {
        if (typeof review.user === "object" && review.user !== null) {
            return review.user as IReviewUser;
        }
        return null;
    };

    const isSubmitting = createReview.isPending || updateReview.isPending;

    return (
        <div className="space-y-6">
            {/* Write Review Card */}
            {isLoggedIn && isEnrolled && (!myReview || isEditing) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            {isEditing ? "Edit Your Review" : "Write a Review"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Star Rating */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Your Rating <span className="text-destructive">*</span>
                                </label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-8 w-8 cursor-pointer transition-all hover:scale-110 ${star <= (hoveredRating || rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-muted-foreground"
                                                }`}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                        />
                                    ))}
                                    {rating > 0 && (
                                        <span className="ml-2 text-sm text-muted-foreground">
                                            {rating === 1 && "Poor"}
                                            {rating === 2 && "Fair"}
                                            {rating === 3 && "Good"}
                                            {rating === 4 && "Very Good"}
                                            {rating === 5 && "Excellent"}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Title (optional) */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Review Title (optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Summarize your experience..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={100}
                                    className="w-full px-3 py-2 border rounded-md bg-background"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Your Review <span className="text-destructive">*</span>
                                </label>
                                <Textarea
                                    placeholder="Share your experience with this course... (minimum 10 characters)"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={4}
                                    maxLength={2000}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {content.length}/2000 characters
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSubmitReview}
                                    disabled={!rating || content.length < 10 || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            {isEditing ? "Updating..." : "Submitting..."}
                                        </>
                                    ) : (
                                        <>{isEditing ? "Update Review" : "Submit Review"}</>
                                    )}
                                </Button>
                                {isEditing && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setRating(0);
                                            setTitle("");
                                            setContent("");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* User's Existing Review */}
            {isLoggedIn && myReview && !isEditing && (
                <Card className="border-primary/50 bg-primary/5">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Your Review
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleEditReview}>
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDeleteReview}
                                    disabled={deleteReview.isPending}
                                    className="text-destructive hover:text-destructive"
                                >
                                    {deleteReview.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Delete
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mb-2">
                            {renderStars(myReview.rating)}
                            <span className="text-sm text-muted-foreground">
                                {formatDate(myReview.createdAt)}
                            </span>
                            {myReview.isEdited && (
                                <Badge variant="outline" className="text-xs">
                                    Edited
                                </Badge>
                            )}
                        </div>
                        {myReview.title && (
                            <h4 className="font-semibold mb-1">{myReview.title}</h4>
                        )}
                        <p className="text-muted-foreground">{myReview.content}</p>
                    </CardContent>
                </Card>
            )}

            {/* Not enrolled message */}
            {isLoggedIn && !isEnrolled && !myReview && (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                            <AlertCircle className="h-5 w-5" />
                            <p className="text-sm">
                                You must be enrolled in this course to leave a review.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Not logged in message */}
            {!isLoggedIn && (
                <Card className="border-muted">
                    <CardContent className="py-4">
                        <p className="text-sm text-muted-foreground text-center">
                            Please login to write a review.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Reviews Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Student Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingReviews ? (
                        <div className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-6 mb-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold">
                                        {ratingSummary?.averageRating?.toFixed(1) || "0.0"}
                                    </div>
                                    <div className="flex items-center justify-center gap-1 mt-1">
                                        {renderStars(Math.round(ratingSummary?.averageRating || 0))}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {ratingSummary?.totalReviews || 0} reviews
                                    </p>
                                </div>
                                <div className="flex-1">
                                    {ratingsPercentages.map(({ rating, count, percentage }) => (
                                        <div key={rating} className="flex items-center gap-2 mb-1">
                                            <span className="text-sm w-3">{rating}</span>
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            <Progress value={parseFloat(percentage)} className="flex-1 h-2" />
                                            <span className="text-sm text-muted-foreground w-12">
                                                {count} ({percentage}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sort Options */}
                            {reviews.length > 0 && (
                                <div className="flex items-center gap-2 mb-4 border-t pt-4">
                                    <span className="text-sm text-muted-foreground">Sort by:</span>
                                    {[
                                        { value: "recent", label: "Most Recent" },
                                        { value: "helpful", label: "Most Helpful" },
                                        { value: "rating_high", label: "Highest Rated" },
                                        { value: "rating_low", label: "Lowest Rated" },
                                    ].map((option) => (
                                        <Button
                                            key={option.value}
                                            variant={sortBy === option.value ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSortBy(option.value as ReviewSortBy)}
                                        >
                                            {option.label}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {/* Reviews List */}
                            {reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map((review: IReview) => {
                                        const user = getReviewUser(review);
                                        return (
                                            <div
                                                key={review._id}
                                                className="border-b pb-4 last:border-b-0"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        {user?.profileImage && (
                                                            <AvatarImage
                                                                src={user.profileImage}
                                                                alt={user.name}
                                                            />
                                                        )}
                                                        <AvatarFallback>
                                                            {user?.name
                                                                ?.split(" ")
                                                                .map((n) => n[0])
                                                                .join("")
                                                                .toUpperCase() || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-medium">
                                                                {user?.name || "Anonymous"}
                                                            </span>
                                                            {renderStars(review.rating, "sm")}
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDate(review.createdAt)}
                                                            </span>
                                                            {review.isVerifiedPurchase && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Verified Purchase
                                                                </Badge>
                                                            )}
                                                            {review.isEdited && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    Edited
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {review.title && (
                                                            <h4 className="font-semibold mt-1">
                                                                {review.title}
                                                            </h4>
                                                        )}
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {review.content}
                                                        </p>

                                                        {/* Instructor Response */}
                                                        {review.instructorResponse?.content && (
                                                            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                                                <p className="text-xs font-medium text-primary mb-1">
                                                                    Instructor Response
                                                                </p>
                                                                <p className="text-sm">
                                                                    {review.instructorResponse.content}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Vote Buttons */}
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <button
                                                                onClick={() => handleVote(review._id, "helpful")}
                                                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                                            >
                                                                <ThumbsUp className="h-4 w-4" />
                                                                <span>Helpful ({review.helpfulVotes})</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleVote(review._id, "not_helpful")}
                                                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                                            >
                                                                <ThumbsDown className="h-4 w-4" />
                                                                <span>({review.notHelpfulVotes})</span>
                                                            </button>
                                                            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors ml-auto">
                                                                <Flag className="h-4 w-4" />
                                                                <span>Report</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">
                                    No reviews yet. Be the first to share your feedback!
                                </p>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default ReviewsSection;
