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
        return response.data;
    },
};

export default classroomApi;
