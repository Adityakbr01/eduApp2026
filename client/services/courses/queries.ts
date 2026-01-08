import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query-keys";
import { adminCourseApi, courseApi, publicCourseApi } from "./api";
import {
    CourseListData,
    ICourse,
    SectionListData,
    LessonListData,
    ContentListData,
    CourseDetailData,
    AdminCoursesResponse,
} from "./types";
import { ApiResponse } from "../auth";

// ==================== INSTRUCTOR COURSE QUERIES ====================

/**
 * Get all instructor courses
 */
export const useGetInstructorCourses = (
    options?: Omit<UseQueryOptions<ApiResponse<CourseListData>>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.COURSES.INSTRUCTOR_COURSES],
        queryFn: () => courseApi.getInstructorCourses(),
        ...options,
    });
};

/**
 * Get course by ID (for editing)
 * API returns { success, message, data: ICourse }
 */
export const useGetCourseById = (
    courseId: string,
    options?: Omit<UseQueryOptions<ApiResponse<ICourse>>, "queryKey" | "queryFn">
) => {
    return useQuery<ApiResponse<ICourse>>({
        queryKey: [QUERY_KEYS.COURSES.DETAIL(courseId)],
        queryFn: () => courseApi.getCourseById(courseId),
        enabled: !!courseId,
        ...options,
    });
};

// ==================== SECTION QUERIES ====================

/**
 * Get all sections of a course
 */
export const useGetSectionsByCourse = (
    courseId: string,
    options?: Omit<UseQueryOptions<ApiResponse<SectionListData>>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.COURSES.SECTIONS(courseId)],
        queryFn: () => courseApi.getSectionsByCourse(courseId),
        enabled: !!courseId,
        ...options,
    });
};

// ==================== LESSON QUERIES ====================

/**
 * Get all lessons of a section
 */
export const useGetLessonsBySection = (
    sectionId: string,
    options?: Omit<UseQueryOptions<ApiResponse<LessonListData>>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.COURSES.LESSONS(sectionId)],
        queryFn: () => courseApi.getLessonsBySection(sectionId),
        enabled: !!sectionId,
        ...options,
    });
};

// ==================== CONTENT QUERIES ====================

/**
 * Get all contents of a lesson
 */
export const useGetContentsByLesson = (
    lessonId: string,
    options?: Omit<UseQueryOptions<ApiResponse<ContentListData>>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.COURSES.CONTENTS(lessonId)],
        queryFn: () => courseApi.getContentsByLesson(lessonId),
        enabled: !!lessonId,
        ...options,
    });
};

// ==================== PUBLIC COURSE QUERIES ====================

/**
 * Get all published courses (public)
 */
export const useGetPublishedCourses = (
    options?: Omit<UseQueryOptions<ApiResponse<CourseListData>>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.COURSES.ALL],
        queryFn: () => publicCourseApi.getAllPublishedCourses(),
        ...options,
    });
};

/**
 * Get published course by ID (public)
 */
export const useGetPublishedCourseById = (
    courseId: string,
    options?: Omit<UseQueryOptions<ApiResponse<CourseDetailData>>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.COURSES.BY_ID, courseId],
        queryFn: () => publicCourseApi.getPublishedCourseById(courseId),
        enabled: !!courseId,
        ...options,
    });
};




// ==================== ADMIN COURSE QUERIES ====================
export const useGetCoursesForAdmin = (
    query: { page?: number; limit?: number; status?: string; search?: string },
    options?: Omit<UseQueryOptions<ApiResponse<AdminCoursesResponse>>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.COURSES.ADMIN_ALL, query],
        queryFn: () => adminCourseApi.getCoursesForAdmin(query),
        ...options,
    });
};