import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query-keys";
import { getCourseReviews, getMyReview } from "./api";
import type { ReviewSortBy } from "./types";

/**
 * Hook to get all reviews for a course
 */
export const useGetCourseReviews = (
    courseId: string,
    options: {
        page?: number;
        limit?: number;
        sortBy?: ReviewSortBy;
    } = {},
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: [...QUERY_KEYS.REVIEWS.BY_COURSE(courseId), options],
        queryFn: () => getCourseReviews(courseId, options),
        enabled: !!courseId && enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Hook to get user's own review for a course
 */
export const useGetMyReview = (courseId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: QUERY_KEYS.REVIEWS.MY_REVIEW(courseId),
        queryFn: () => getMyReview(courseId),
        enabled: !!courseId && enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
