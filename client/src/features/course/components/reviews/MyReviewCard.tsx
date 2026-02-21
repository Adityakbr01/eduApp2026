"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Edit2, Loader2, Trash2 } from "lucide-react";

import type { MyReviewCardProps } from "../../types";
import { renderStars, formatReviewDate } from "../../utils";

export default function MyReviewCard({
  review,
  isDeleting,
  onEdit,
  onDelete,
}: MyReviewCardProps) {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Your Review
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              {isDeleting ? (
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
          {renderStars(review.rating)}
          <span className="text-sm text-muted-foreground">
            {formatReviewDate(review.createdAt)}
          </span>
          {review.isEdited && (
            <Badge variant="outline" className="text-xs">
              Edited
            </Badge>
          )}
        </div>
        {review.title && <h4 className="font-semibold mb-1">{review.title}</h4>}
        <p className="text-muted-foreground">{review.content}</p>
      </CardContent>
    </Card>
  );
}
