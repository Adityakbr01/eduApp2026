import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query-keys";
import { quizApi, assignmentApi } from "./api";

// ============================================
// QUIZ QUERIES
// ============================================

/**
 * Get quiz by ID
 */
export const useQuizById = (quizId: string, enabled = true) => {
    return useQuery({
        queryKey: QUERY_KEYS.ASSESSMENTS.QUIZ_BY_ID(quizId),
        queryFn: () => quizApi.getById(quizId),
        enabled: enabled && !!quizId,
        select: (data) => data.data,
    });
};

/**
 * Get quiz by content ID
 */
export const useQuizByContentId = (contentId: string, enabled = true) => {
    return useQuery({
        queryKey: QUERY_KEYS.ASSESSMENTS.QUIZ_BY_CONTENT(contentId),
        queryFn: () => quizApi.getByContentId(contentId),
        enabled: enabled && !!contentId,
        select: (data) => data.data,
    });
};

/**
 * Get quizzes by lesson
 */
export const useQuizzesByLesson = (lessonId: string, enabled = true) => {
    return useQuery({
        queryKey: QUERY_KEYS.ASSESSMENTS.QUIZZES_BY_LESSON(lessonId),
        queryFn: () => quizApi.getByLesson(lessonId),
        enabled: enabled && !!lessonId,
        select: (data) => data.data,
    });
};

/**
 * Get quizzes by course
 */
export const useQuizzesByCourse = (courseId: string, enabled = true) => {
    return useQuery({
        queryKey: QUERY_KEYS.ASSESSMENTS.QUIZZES_BY_COURSE(courseId),
        queryFn: () => quizApi.getByCourse(courseId),
        enabled: enabled && !!courseId,
        select: (data) => data.data,
    });
};

/**
 * Get quiz for student (hides correct answers)
 */
export const useQuizForStudent = (quizId: string, enabled = true) => {
    return useQuery({
        queryKey: QUERY_KEYS.ASSESSMENTS.QUIZ_FOR_STUDENT(quizId),
        queryFn: () => quizApi.getForStudent(quizId),
        enabled: enabled && !!quizId,
        select: (data) => data.data,
    });
};

// ============================================
// ASSIGNMENT QUERIES
// ============================================

/**
 * Get assignment by ID
 */
export const useAssignmentById = (assignmentId: string, enabled = true) => {
    return useQuery({
        queryKey: QUERY_KEYS.ASSESSMENTS.ASSIGNMENT_BY_ID(assignmentId),
        queryFn: () => assignmentApi.getById(assignmentId),
        enabled: enabled && !!assignmentId,
        select: (data) => data.data,
    });
};

/**
 * Get assignment by content ID
 */
export const useAssignmentByContentId = (contentId: string, enabled = true) => {
    return useQuery({
        queryKey: QUERY_KEYS.ASSESSMENTS.ASSIGNMENT_BY_CONTENT(contentId),
        queryFn: () => assignmentApi.getByContentId(contentId),
        enabled: enabled && !!contentId,
        select: (data) => data.data,
    });
};

/**
 * Get assignments by lesson
 */
export const useAssignmentsByLesson = (lessonId: string, enabled = true) => {
    return useQuery({
        queryKey: QUERY_KEYS.ASSESSMENTS.ASSIGNMENTS_BY_LESSON(lessonId),
        queryFn: () => assignmentApi.getByLesson(lessonId),
        enabled: enabled && !!lessonId,
        select: (data) => data.data,
    });
};

/**
 * Get assignments by course
 */
export const useAssignmentsByCourse = (courseId: string, enabled = true) => {
    return useQuery({
        queryKey: QUERY_KEYS.ASSESSMENTS.ASSIGNMENTS_BY_COURSE(courseId),
        queryFn: () => assignmentApi.getByCourse(courseId),
        enabled: enabled && !!courseId,
        select: (data) => data.data,
    });
};

/**
 * Get upcoming assignments by course
 */
export const useUpcomingAssignments = (courseId: string, enabled = true) => {
    return useQuery({
        queryKey: QUERY_KEYS.ASSESSMENTS.UPCOMING_ASSIGNMENTS(courseId),
        queryFn: () => assignmentApi.getUpcoming(courseId),
        enabled: enabled && !!courseId,
        select: (data) => data.data,
    });
};
