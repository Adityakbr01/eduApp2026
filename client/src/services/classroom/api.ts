import apiClient from "@/lib/api/axios";
import { ClassroomDataResponse } from "./types";

// ==================== API RESPONSE TYPE ====================

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// ==================== CLASSROOM API ====================

export const classroomApi = {
    /**
     * Get classroom data (enrolled courses with progress)
     */
    getClassroomData: async (): Promise<ApiResponse<ClassroomDataResponse>> => {
        const response = await apiClient.get("/classroom");
        console.log("batchData", response.data);
        return response.data;
    },

    /**
     * Get heatmap data
     */
    getHeatmapData: async (): Promise<ApiResponse<{ date: string; count: number }[]>> => {
        const response = await apiClient.get("/classroom/heatmap");
        return response.data;
    },
};

export default classroomApi;
