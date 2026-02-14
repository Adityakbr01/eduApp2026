import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query-keys";
import { batchApi } from "./batch-api";

// ==================== BATCH QUERIES ====================

/**
 * Get batch detail (sections, contents with progress/deadline/penalty)
 */
export const useGetBatchDetail = (courseId: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.CLASSROOM.BATCH(courseId),
        queryFn: () => batchApi.getBatchDetail(courseId),
        enabled: !!courseId,
        staleTime: 1000 * 60 * 2,
    });
};

/**
 * Get lesson detail (video URL, PDF, audio, assessment info)
 */
export const useGetLessonDetail = (courseId: string, lessonId: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.CLASSROOM.LESSON(courseId, lessonId),
        queryFn: () => batchApi.getLessonDetail(courseId, lessonId),
        enabled: !!courseId && !!lessonId,
        staleTime: 1000 * 60 * 2,
    });
};

/**
 * Get content detail (video URL, PDF, audio, assessment info)
 */
export const useGetContentDetail = (courseId: string, contentId: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.CLASSROOM.CONTENT(courseId, contentId),
        queryFn: () => batchApi.getContentDetail(courseId, contentId),
        enabled: !!courseId && !!contentId,
        staleTime: 1000 * 60 * 2,
    });
};


/**
 * Get leaderboard
 */
export const useGetBatchLeaderboard = (courseId: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.CLASSROOM.LEADERBOARD(courseId),
        queryFn: () => batchApi.getBatchLeaderboard(courseId),
        enabled: !!courseId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// 