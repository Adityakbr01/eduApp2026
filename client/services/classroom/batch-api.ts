import apiClient from "@/lib/api/axios";
import { BatchDetailResponse, ContentDetailResponse } from "./batch-types";

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
     * Get content detail (video URL, PDF, audio, assessment info)
     */
    getContentDetail: async (courseId: string, contentId: string): Promise<ApiResponse<ContentDetailResponse>> => {
        const response = await apiClient.get(`/classroom/${courseId}/content/${contentId}`);
        return response.data;
    },
};
