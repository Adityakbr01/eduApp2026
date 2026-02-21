"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Star } from "lucide-react";

import type { ReviewFormProps } from "../../types";

export default function ReviewForm({
  rating,
  hoveredRating,
  content,
  title,
  isEditing,
  isSubmitting,
  onRatingChange,
  onHoveredRatingChange,
  onContentChange,
  onTitleChange,
  onSubmit,
  onCancelEdit,
}: ReviewFormProps) {
  return (
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
                  className={`h-8 w-8 cursor-pointer transition-all hover:scale-110 ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => onRatingChange(star)}
                  onMouseEnter={() => onHoveredRatingChange(star)}
                  onMouseLeave={() => onHoveredRatingChange(0)}
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
              onChange={(e) => onTitleChange(e.target.value)}
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
              onChange={(e) => onContentChange(e.target.value)}
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
              onClick={onSubmit}
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
              <Button variant="outline" onClick={onCancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
