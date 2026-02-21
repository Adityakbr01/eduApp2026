import { IReview, IReviewUser } from "@/services/reviews";

// ==================== Reviews Types ====================

export interface ReviewsSectionProps {
    courseId: string;
}

export interface ReviewFormProps {
    rating: number;
    hoveredRating: number;
    content: string;
    title: string;
    isEditing: boolean;
    isSubmitting: boolean;
    onRatingChange: (rating: number) => void;
    onHoveredRatingChange: (rating: number) => void;
    onContentChange: (content: string) => void;
    onTitleChange: (title: string) => void;
    onSubmit: () => void;
    onCancelEdit: () => void;
}

export interface MyReviewCardProps {
    review: IReview;
    isDeleting: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export interface ReviewCardProps {
    review: IReview;
    onVote: (reviewId: string, voteType: "helpful" | "not_helpful") => void;
}

export interface RatingSummaryProps {
    ratingSummary: {
        averageRating: number;
        totalReviews: number;
        ratingsDistribution: {
            five: number;
            four: number;
            three: number;
            two: number;
            one: number;
        };
    } | undefined;
    sortBy: string;
    onSortChange: (sortBy: string) => void;
    hasReviews: boolean;
}

// ==================== Curriculum Types ====================

export interface CourseCurriculumProps {
    curriculum: string;
}

export interface ParsedSection {
    title: string;
    modules: ParsedModule[];
}

export interface ParsedModule {
    title: string;
    topics: string[];
}

// ==================== Re-exports ====================
export type { IReview, IReviewUser };
