import apiClient from "@/lib/api/axios";
import type { ApiResponse } from "@/services/courses";
import type {
    CreateReviewRequest,
    InstructorResponseRequest,
    ReportReviewRequest,
    ReviewActionResponse,
    ReviewsResponse,
    ReviewSortBy,
    SingleReviewResponse,
    UpdateReviewRequest,
    VoteReviewRequest,
} from "./types";

// ==================== REVIEW API ====================

/**
 * Get all reviews for a course
 */
export const getCourseReviews = async (
    courseId: string,
    options: {
        page?: number;
        limit?: number;
        sortBy?: ReviewSortBy;
    } = {}
): Promise<ApiResponse<ReviewsResponse>> => {
    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.sortBy) params.append("sortBy", options.sortBy);

    const queryString = params.toString();
    const url = `/reviews/${courseId}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<ApiResponse<ReviewsResponse>>(url);
    return response.data;
};

/**
 * Get user's own review for a course
 */
export const getMyReview = async (
    courseId: string
): Promise<ApiResponse<SingleReviewResponse>> => {
    const response = await apiClient.get<ApiResponse<SingleReviewResponse>>(
        `/reviews/${courseId}/my-review`
    );
    return response.data;
};

/**
 * Create a new review
 */
export const createReview = async (
    courseId: string,
    data: CreateReviewRequest
): Promise<ApiResponse<ReviewActionResponse>> => {
    const response = await apiClient.post<ApiResponse<ReviewActionResponse>>(
        `/reviews/${courseId}`,
        data
    );
    return response.data;
};

/**
 * Update a review
 */
export const updateReview = async (
    reviewId: string,
    data: UpdateReviewRequest
): Promise<ApiResponse<ReviewActionResponse>> => {
    const response = await apiClient.put<ApiResponse<ReviewActionResponse>>(
        `/reviews/${reviewId}`,
        data
    );
    return response.data;
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/reviews/${reviewId}`);
    return response.data;
};

/**
 * Vote on a review
 */
export const voteReview = async (
    reviewId: string,
    data: VoteReviewRequest
): Promise<ApiResponse<ReviewActionResponse>> => {
    const response = await apiClient.post<ApiResponse<ReviewActionResponse>>(
        `/reviews/${reviewId}/vote`,
        data
    );
    return response.data;
};

/**
 * Report a review
 */
export const reportReview = async (
    reviewId: string,
    data: ReportReviewRequest
): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
        `/reviews/${reviewId}/report`,
        data
    );
    return response.data;
};

/**
 * Add instructor response to a review
 */
export const addInstructorResponse = async (
    reviewId: string,
    data: InstructorResponseRequest
): Promise<ApiResponse<ReviewActionResponse>> => {
    const response = await apiClient.post<ApiResponse<ReviewActionResponse>>(
        `/reviews/${reviewId}/respond`,
        data
    );
    return response.data;
};
