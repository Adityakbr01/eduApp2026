import apiClient from "@/lib/api/axios";
import {
    CourseListData,
    CourseDetailData,
    SectionListData,
    SectionDetailData,
    LessonListData,
    LessonDetailData,
    ContentListData,
    ContentDetailData,
    CreateCourseDTO,
    UpdateCourseDTO,
    CreateSectionDTO,
    UpdateSectionDTO,
    CreateLessonDTO,
    UpdateLessonDTO,
    CreateContentDTO,
    UpdateContentDTO,
    ReorderItemDTO,
    CourseStatus,
} from "./types";
import { ApiResponse } from "../auth";

// ==================== BASE PATH ====================

const INSTRUCTOR_BASE = "/courses/instructor";
const ADMIN_BASE = "/courses/admin";

// ==================== COURSE API (INSTRUCTOR) ====================

export const courseApi = {
    // ============================
    // 📚 COURSE CRUD
    // ============================

    /**
     * Create a new course
     */
    createCourse: async (data: CreateCourseDTO): Promise<ApiResponse<CourseDetailData>> => {
        const response = await apiClient.post(`${INSTRUCTOR_BASE}/`, data);
        return response.data;
    },

    /**
     * Get all instructor courses
     */
    getInstructorCourses: async (): Promise<ApiResponse<CourseListData>> => {
        const response = await apiClient.get(`${INSTRUCTOR_BASE}/`);
        return response.data;
    },

    /**
     * Get course by ID (for editing)
     */
    getCourseById: async (id: string): Promise<ApiResponse<CourseDetailData>> => {
        const response = await apiClient.get(`${INSTRUCTOR_BASE}/${id}`);
        return response.data;
    },

    /**
     * Update course
     */
    updateCourse: async (id: string, data: UpdateCourseDTO): Promise<ApiResponse<CourseDetailData>> => {
        const response = await apiClient.put(`${INSTRUCTOR_BASE}/${id}`, data);
        return response.data;
    },

    /**
     * Delete course
     */
    deleteCourse: async (id: string): Promise<ApiResponse<null>> => {
        const response = await apiClient.delete(`${INSTRUCTOR_BASE}/${id}`);
        return response.data;
    },

    /**
     * Publish/unpublish course
     */
    toggleCourseStatus: async (data: { id: string; status: CourseStatus.PUBLISHED | CourseStatus.UNPUBLISHED }) => {
    const { id, status } = data;
    const response = await apiClient.put(`${INSTRUCTOR_BASE}/${id}/toggleCourseStatus`, { status });
    return response.data;
},


    // ============================
    // 📂 SECTION CRUD
    // ============================

    /**
     * Create a section in a course
     */
    createSection: async (courseId: string, data: CreateSectionDTO): Promise<ApiResponse<SectionDetailData>> => {
        const response = await apiClient.post(`${INSTRUCTOR_BASE}/${courseId}/section`, data);
        return response.data;
    },

    /**
     * Get all sections of a course
     */
    getSectionsByCourse: async (courseId: string): Promise<ApiResponse<SectionListData>> => {
        const response = await apiClient.get(`${INSTRUCTOR_BASE}/${courseId}/section`);
        return response.data;
    },

    /**
     * Update a section
     */
    updateSection: async (sectionId: string, data: UpdateSectionDTO): Promise<ApiResponse<SectionDetailData>> => {
        const response = await apiClient.put(`${INSTRUCTOR_BASE}/section/${sectionId}`, data);
        return response.data;
    },

    /**
     * Delete a section
     */
    deleteSection: async (sectionId: string): Promise<ApiResponse<null>> => {
        const response = await apiClient.delete(`${INSTRUCTOR_BASE}/section/${sectionId}`);
        return response.data;
    },

    /**
     * Toggle section visibility
     */
    toggleSectionVisibility: async (sectionId: string): Promise<ApiResponse<SectionDetailData>> => {
        const response = await apiClient.put(`${INSTRUCTOR_BASE}/section/${sectionId}/visibility`);
        return response.data;
    },

    /**
     * Reorder sections in a course
     */
    reorderSections: async (courseId: string, items: ReorderItemDTO[]): Promise<ApiResponse<null>> => {
        const response = await apiClient.put(`${INSTRUCTOR_BASE}/${courseId}/sections/reorder`, items);
        return response.data;
    },

    // ============================
    // 📖 LESSON CRUD
    // ============================

    /**
     * Create a lesson in a section
     */
    createLesson: async (sectionId: string, data: CreateLessonDTO): Promise<ApiResponse<LessonDetailData>> => {
        const response = await apiClient.post(`${INSTRUCTOR_BASE}/section/${sectionId}/lesson`, data);
        return response.data;
    },

    /**
     * Get all lessons of a section
     */
    getLessonsBySection: async (sectionId: string): Promise<ApiResponse<LessonListData>> => {
        const response = await apiClient.get(`${INSTRUCTOR_BASE}/section/${sectionId}/lesson`);
        return response.data;
    },

    /**
     * Update a lesson
     */
    updateLesson: async (lessonId: string, data: UpdateLessonDTO): Promise<ApiResponse<LessonDetailData>> => {
        const response = await apiClient.put(`${INSTRUCTOR_BASE}/lesson/${lessonId}`, data);
        return response.data;
    },

    /**
     * Delete a lesson
     */
    deleteLesson: async (lessonId: string): Promise<ApiResponse<null>> => {
        const response = await apiClient.delete(`${INSTRUCTOR_BASE}/lesson/${lessonId}`);
        return response.data;
    },

    /**
     * Toggle lesson visibility
     */
    toggleLessonVisibility: async (lessonId: string): Promise<ApiResponse<LessonDetailData>> => {
        const response = await apiClient.put(`${INSTRUCTOR_BASE}/lesson/${lessonId}/visibility`);
        return response.data;
    },

    /**
     * Reorder lessons in a section
     */
    reorderLessons: async (sectionId: string, items: ReorderItemDTO[]): Promise<ApiResponse<null>> => {
        const response = await apiClient.put(`${INSTRUCTOR_BASE}/section/${sectionId}/lessons/reorder`, items);
        return response.data;
    },

    // ============================
    // 📄 LESSON CONTENT CRUD
    // ============================

    /**
     * Create content in a lesson
     */
    createContent: async (lessonId: string, data: CreateContentDTO): Promise<ApiResponse<ContentDetailData>> => {
        const response = await apiClient.post(`${INSTRUCTOR_BASE}/lesson/${lessonId}/content`, data);
        return response.data;
    },

    /**
     * Get all contents of a lesson
     */
    getContentsByLesson: async (lessonId: string): Promise<ApiResponse<ContentListData>> => {
        const response = await apiClient.get(`${INSTRUCTOR_BASE}/lesson/${lessonId}/content`);
        return response.data;
    },

    /**
     * Update a content
     */
    updateContent: async (contentId: string, data: UpdateContentDTO): Promise<ApiResponse<ContentDetailData>> => {
        const response = await apiClient.put(`${INSTRUCTOR_BASE}/content/${contentId}`, data);
        return response.data;
    },

    /**
     * Delete a content
     */
    deleteContent: async (contentId: string): Promise<ApiResponse<null>> => {
        const response = await apiClient.delete(`${INSTRUCTOR_BASE}/content/${contentId}`);
        return response.data;
    },

    /**
     * Toggle content visibility
     */
    toggleContentVisibility: async (contentId: string): Promise<ApiResponse<ContentDetailData>> => {
        const response = await apiClient.put(`${INSTRUCTOR_BASE}/content/${contentId}/visibility`);
        return response.data;
    },

    /**
     * Reorder contents in a lesson
     */
    reorderContents: async (lessonId: string, items: ReorderItemDTO[]): Promise<ApiResponse<null>> => {
        const response = await apiClient.put(`${INSTRUCTOR_BASE}/lesson/${lessonId}/contents/reorder`, items);
        return response.data;
    },
};

// ==================== PUBLIC COURSE API ====================

export const publicCourseApi = {
    /**
     * Get all published courses
     */
    getAllPublishedCourses: async (): Promise<ApiResponse<CourseListData>> => {
        const response = await apiClient.get("/courses");
        return response.data;
    },

    /**
     * Get published course by ID
     */
    getPublishedCourseById: async (id: string): Promise<ApiResponse<CourseDetailData>> => {
        const response = await apiClient.get(`/courses/${id}`);
        return response.data;
    },
};





    interface ToggleCourseStatusAdminPayload {
  requestId: string;
  action: CourseStatus.APPROVED | CourseStatus.REJECTED;
  reason?: string;
}
// ==================== ADMIN COURSE API ====================

export const adminCourseApi = {
    getCoursesForAdmin: async (query: { page?: number; limit?: number; status?: string; search?: string }) => {
        const response = await apiClient.get(`${ADMIN_BASE}`, { params: query });
        return response.data;
    },

 toggleCourseStatusAdmin : async (data: ToggleCourseStatusAdminPayload) => {
    const { requestId, action, reason } = data;
    const response = await apiClient.put(`${ADMIN_BASE}/course-status-requests/${requestId}/review`, { action, reason });
    return response.data;
    },
    toggleFeaturedCourse: async (courseId: string): Promise<ApiResponse<CourseDetailData>> => {
        const response = await apiClient.put(`${ADMIN_BASE}/${courseId}/toggleFeatured`);
        return response.data;
    }
};
