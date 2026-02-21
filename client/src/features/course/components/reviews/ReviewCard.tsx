"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Flag, ThumbsDown, ThumbsUp } from "lucide-react";

import type { ReviewCardProps } from "../../types";
import { renderStars, formatReviewDate, getReviewUser } from "../../utils";

export default function ReviewCard({ review, onVote }: ReviewCardProps) {
  const user = getReviewUser(review);

  return (
    <div className="border-b pb-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          {user?.profileImage && (
            <AvatarImage src={user.profileImage} alt={user.name} />
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
            <span className="font-medium">{user?.name || "Anonymous"}</span>
            {renderStars(review.rating, "sm")}
            <span className="text-xs text-muted-foreground">
              {formatReviewDate(review.createdAt)}
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
            <h4 className="font-semibold mt-1">{review.title}</h4>
          )}
          <p className="text-sm text-muted-foreground mt-1">{review.content}</p>

          {/* Instructor Response */}
          {review.instructorResponse?.content && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-primary mb-1">
                Instructor Response
              </p>
              <p className="text-sm">{review.instructorResponse.content}</p>
            </div>
          )}

          {/* Vote Buttons */}
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => onVote(review._id, "helpful")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>Helpful ({review.helpfulVotes})</span>
            </button>
            <button
              onClick={() => onVote(review._id, "not_helpful")}
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
}
