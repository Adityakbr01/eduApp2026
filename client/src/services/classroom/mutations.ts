import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query-keys";
import { assessmentApi } from "./assessment-api";
import { contentProgressApi } from "./content-progress-api";

// ==================== ASSESSMENTS MUTATIONS (STUDENT) ====================

/**
 * Submit a single quiz question
 */
export const useSubmitQuizQuestion = (quizId: string) => {
    return useMutation({
        mutationFn: (data: { questionId: string; selectedOptionIndex: number }) =>
            assessmentApi.submitQuizQuestion(quizId, data),
    });
};

/**
 * Submit final quiz (or fetch final status)
 */
export const useSubmitQuizFinal = (courseId: string, contentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (quizId: string) => assessmentApi.getQuizAttempt(quizId),
        onSuccess: () => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.CLASSROOM.CONTENT(courseId, contentId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.CLASSROOM.BATCH(courseId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.CLASSROOM.DATA,
            });
            queryClient.invalidateQueries({
                queryKey: ["classroom", "lesson", courseId],
            });
        },
    });
};

/**
 * Submit an assignment
 */
export const useSubmitAssignment = (courseId: string, contentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ assignmentId, data }: { assignmentId: string; data: any }) =>
            assessmentApi.submitAssignment(assignmentId, data),
        onSuccess: () => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.CLASSROOM.CONTENT(courseId, contentId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.CLASSROOM.BATCH(courseId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.CLASSROOM.DATA,
            });
            queryClient.invalidateQueries({
                queryKey: ["classroom", "lesson", courseId],
            });
        },
    });
};

// ==================== PROGRESS MUTATIONS ====================

/**
 * Mark content as completed
 */
export const useMarkContentCompleted = (courseId: string, contentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { obtainedMarks?: number; completionMethod?: "auto" | "manual" }) =>
            contentProgressApi.markCompleted(contentId, data),
        onSuccess: () => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.CLASSROOM.CONTENT(courseId, contentId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.CLASSROOM.BATCH(courseId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.CLASSROOM.DATA,
            });
            queryClient.invalidateQueries({
                queryKey: ["classroom", "lesson", courseId],
            });
        },
    });
};
