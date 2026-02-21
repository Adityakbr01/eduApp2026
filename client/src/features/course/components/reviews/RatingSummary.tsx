"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";
import { ReviewSortBy } from "@/services/reviews";

import { renderStars } from "../../utils";

interface RatingSummaryProps {
  ratingSummary:
    | {
        averageRating: number;
        totalReviews: number;
        ratingsDistribution: {
          five: number;
          four: number;
          three: number;
          two: number;
          one: number;
        };
      }
    | undefined;
  ratingsPercentages: {
    rating: number;
    count: number;
    percentage: string;
  }[];
  sortBy: string;
  onSortChange: (sortBy: ReviewSortBy) => void;
  hasReviews: boolean;
}

export default function RatingSummary({
  ratingSummary,
  ratingsPercentages,
  sortBy,
  onSortChange,
  hasReviews,
}: RatingSummaryProps) {
  return (
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
      {hasReviews && (
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
              onClick={() => onSortChange(option.value as ReviewSortBy)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}
    </>
  );
}
