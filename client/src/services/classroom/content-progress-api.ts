import apiClient from "@/lib/api/axios";

// ==================== CONTENT PROGRESS API ====================

export const contentProgressApi = {
    /**
     * Mark content as completed
     * PUT /courses/student/content/:contentId/complete
     */
    markCompleted: async (
        contentId: string,
        data: { obtainedMarks?: number; completionMethod?: "auto" | "manual" },
    ) => {
        const response = await apiClient.put(`/courses/student/content/${contentId}/complete`, data);
        return response.data;
    },

    /**
     * Update resume position
     * PUT /courses/student/content/:contentId/resume
     */
    updateResume: async (
        contentId: string,
        data: { resumeAt: number; totalDuration?: number },
    ) => {
        const response = await apiClient.put(`/courses/student/content/${contentId}/resume`, data);
        return response.data;
    },

    /**
     * Save general progress
     * POST /courses/student/content/:contentId/progress
     */
    saveProgress: async (
        contentId: string,
        data: {
            resumeAt?: number;
            totalDuration?: number;
            obtainedMarks?: number;
            isCompleted?: boolean;
        },
    ) => {
        const response = await apiClient.post(`/courses/student/content/${contentId}/progress`, data);
        return response.data;
    },
};
