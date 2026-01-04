import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query-keys";
import {
    createReview,
    updateReview,
    deleteReview,
    voteReview,
    reportReview,
    addInstructorResponse,
} from "./api";
import type {
    CreateReviewRequest,
    UpdateReviewRequest,
    VoteReviewRequest,
    ReportReviewRequest,
    InstructorResponseRequest,
} from "./types";

/**
 * Hook to create a new review
 */
export const useCreateReview = (courseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateReviewRequest) => createReview(courseId, data),
        onSuccess: () => {
            // Invalidate reviews list and course details (for rating stats)
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.REVIEWS.BY_COURSE(courseId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.REVIEWS.MY_REVIEW(courseId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.COURSES.ALL,
            });
        },
    });
};

/**
 * Hook to update a review
 */
export const useUpdateReview = (courseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reviewId, data }: { reviewId: string; data: UpdateReviewRequest }) =>
            updateReview(reviewId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.REVIEWS.BY_COURSE(courseId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.REVIEWS.MY_REVIEW(courseId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.COURSES.ALL,
            });
        },
    });
};

/**
 * Hook to delete a review
 */
export const useDeleteReview = (courseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reviewId: string) => deleteReview(reviewId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.REVIEWS.BY_COURSE(courseId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.REVIEWS.MY_REVIEW(courseId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.COURSES.ALL,
            });
        },
    });
};

/**
 * Hook to vote on a review
 */
export const useVoteReview = (courseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reviewId, data }: { reviewId: string; data: VoteReviewRequest }) =>
            voteReview(reviewId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.REVIEWS.BY_COURSE(courseId),
            });
        },
    });
};

/**
 * Hook to report a review
 */
export const useReportReview = () => {
    return useMutation({
        mutationFn: ({ reviewId, data }: { reviewId: string; data: ReportReviewRequest }) =>
            reportReview(reviewId, data),
    });
};

/**
 * Hook to add instructor response
 */
export const useAddInstructorResponse = (courseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reviewId, data }: { reviewId: string; data: InstructorResponseRequest }) =>
            addInstructorResponse(reviewId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.REVIEWS.BY_COURSE(courseId),
            });
        },
    });
};
