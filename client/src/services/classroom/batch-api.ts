import apiClient from "@/lib/api/axios";
import { BatchDetailResponse, ContentDetailResponse, LessonDetailResponse, LeaderboardResponse } from "./batch-types";

// ==================== API RESPONSE TYPE ====================

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// ==================== BATCH API ====================

export const batchApi = {
    /**
     * Get batch detail (sections, contents with progress/deadline/penalty)
     */
    getBatchDetail: async (courseId: string): Promise<ApiResponse<BatchDetailResponse>> => {
        const response = await apiClient.get(`/classroom/${courseId}/batch`);
        return response.data;
    },

    /**
     * Get lesson detail (video URL, PDF, audio, assessment info)
     */
    getLessonDetail: async (courseId: string, lessonId: string): Promise<ApiResponse<LessonDetailResponse>> => {
        const response = await apiClient.get(`/classroom/${courseId}/lesson/${lessonId}`);
        return response.data;
    },

    /**
     * Get content detail (video URL, PDF, audio, assessment info)
     */
    getContentDetail: async (courseId: string, contentId: string): Promise<ApiResponse<ContentDetailResponse>> => {
        const response = await apiClient.get(`/classroom/${courseId}/content/${contentId}`);
        return response.data;
    },

    /**
     * Get leaderboard
     */
    getBatchLeaderboard: async (courseId: string): Promise<ApiResponse<LeaderboardResponse>> => {
        const response = await apiClient.get(`/classroom/${courseId}/leaderboard`);
        return response.data;
    },
};
