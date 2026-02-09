import apiClient from "@/lib/api/axios";
import {
    EnrollmentStatusResponse,
    EnrollInCourseResponse,
    MyEnrolledCoursesResponse,
} from "./types";

// ==================== API RESPONSE TYPE ====================

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// ==================== ENROLLMENT API ====================

export const enrollmentApi = {
    // ============================
    // 📚 ENROLLMENT
    // ============================

    /**
     * Enroll in a free course
     */
    enrollInCourse: async (courseId: string): Promise<ApiResponse<EnrollInCourseResponse>> => {
        const response = await apiClient.post(`/enroll/${courseId}`);
        return response.data;
    },

    /**
     * Check enrollment status for a course
     */
    checkEnrollmentStatus: async (courseId: string): Promise<ApiResponse<EnrollmentStatusResponse>> => {
        const response = await apiClient.get(`/enroll/${courseId}/status`);
        return response.data;
    },

    /**
     * Get all enrolled courses for current user
     */
    getMyEnrolledCourses: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<ApiResponse<MyEnrolledCoursesResponse>> => {
        const response = await apiClient.get("/my-courses", { params });
        return response.data;
    },
};

export default enrollmentApi;
