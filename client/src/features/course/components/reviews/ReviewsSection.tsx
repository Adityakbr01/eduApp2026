"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { IReview } from "@/services/reviews";

import { useReviewForm } from "../../hooks/useReviewForm";
import ReviewForm from "./ReviewForm";
import MyReviewCard from "./MyReviewCard";
import ReviewCard from "./ReviewCard";
import RatingSummary from "./RatingSummary";

interface ReviewsSectionProps {
  courseId: string;
}

export function ReviewsSection({ courseId }: ReviewsSectionProps) {
  const {
    isLoggedIn,
    isEnrolled,
    rating,
    setRating,
    hoveredRating,
    setHoveredRating,
    content,
    setContent,
    title,
    setTitle,
    isEditing,
    sortBy,
    setSortBy,
    reviews,
    ratingSummary,
    ratingsPercentages,
    myReview,
    isLoadingReviews,
    isSubmitting,
    isDeleting,
    handleSubmitReview,
    handleEditReview,
    handleDeleteReview,
    handleVote,
    resetForm,
  } = useReviewForm(courseId);

  return (
    <div className="space-y-6">
      {/* Write Review Card */}
      {isLoggedIn && isEnrolled && (!myReview || isEditing) && (
        <ReviewForm
          rating={rating}
          hoveredRating={hoveredRating}
          content={content}
          title={title}
          isEditing={isEditing}
          isSubmitting={isSubmitting}
          onRatingChange={setRating}
          onHoveredRatingChange={setHoveredRating}
          onContentChange={setContent}
          onTitleChange={setTitle}
          onSubmit={handleSubmitReview}
          onCancelEdit={resetForm}
        />
      )}

      {/* User's Existing Review */}
      {isLoggedIn && myReview && !isEditing && (
        <MyReviewCard
          review={myReview}
          isDeleting={isDeleting}
          onEdit={handleEditReview}
          onDelete={handleDeleteReview}
        />
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
              <RatingSummary
                ratingSummary={ratingSummary}
                ratingsPercentages={ratingsPercentages}
                sortBy={sortBy}
                onSortChange={setSortBy}
                hasReviews={reviews.length > 0}
              />

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: IReview) => (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      onVote={handleVote}
                    />
                  ))}
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
