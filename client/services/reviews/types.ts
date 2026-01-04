// ==================== ENUMS ====================

export enum ReviewStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    FLAGGED = "flagged",
}

export type VoteType = "helpful" | "not_helpful";

export type ReportReason = "spam" | "inappropriate" | "fake" | "offensive" | "irrelevant" | "other";

export type ReviewSortBy = "recent" | "helpful" | "rating_high" | "rating_low";

// ==================== INTERFACES ====================

export interface IReviewUser {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
}

export interface IReviewCourse {
    _id: string;
    title: string;
    slug: string;
}

export interface IDetailedRatings {
    contentQuality?: number;
    instructorSkills?: number;
    valueForMoney?: number;
    courseStructure?: number;
    practicalApplication?: number;
}

export interface IVoter {
    user: string;
    voteType: VoteType;
    votedAt: string;
}

export interface IInstructorResponse {
    content: string;
    respondedAt: string;
    respondedBy: string;
}

export interface IReview {
    _id: string;
    course: string | IReviewCourse;
    user: string | IReviewUser;
    enrollment?: string;
    rating: number;
    title?: string;
    content: string;
    detailedRatings?: IDetailedRatings;
    status: ReviewStatus;
    helpfulVotes: number;
    notHelpfulVotes: number;
    voters?: IVoter[];
    instructorResponse?: IInstructorResponse;
    isVerifiedPurchase: boolean;
    courseCompletionPercentage: number;
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IRatingSummary {
    averageRating: number;
    totalReviews: number;
    ratingsDistribution: {
        one: number;
        two: number;
        three: number;
        four: number;
        five: number;
    };
}

// ==================== REQUEST TYPES ====================

export interface CreateReviewRequest {
    rating: number;
    title?: string;
    content: string;
}

export interface UpdateReviewRequest {
    rating?: number;
    title?: string;
    content?: string;
}

export interface VoteReviewRequest {
    voteType: VoteType;
}

export interface ReportReviewRequest {
    reason: ReportReason;
    description?: string;
}

export interface InstructorResponseRequest {
    content: string;
}

// ==================== RESPONSE TYPES ====================

export interface ReviewsResponse {
    reviews: IReview[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    ratingSummary: IRatingSummary;
}

export interface SingleReviewResponse {
    review: IReview | null;
}

export interface ReviewActionResponse {
    review: IReview;
}
