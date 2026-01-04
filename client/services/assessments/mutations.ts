import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query-keys";
import { quizApi, assignmentApi } from "./api";
import {
    CreateQuizDTO,
    UpdateQuizDTO,
    IQuizQuestion,
    CreateAssignmentDTO,
    UpdateAssignmentDTO,
} from "./types";

// ============================================
// QUIZ MUTATIONS
// ============================================

/**
 * Create a new quiz
 */
export const useCreateQuiz = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateQuizDTO) => quizApi.create(data),
        onSuccess: (_, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.ASSESSMENTS.QUIZZES_BY_LESSON(variables.lessonId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.ASSESSMENTS.QUIZZES_BY_COURSE(variables.courseId),
            });
        },
    });
};

/**
 * Update a quiz
 */
export const useUpdateQuiz = (quizId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateQuizDTO) => quizApi.update(quizId, data),
        onSuccess: (response) => {
            const quiz = response.data;
            // Invalidate specific quiz query
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.ASSESSMENTS.QUIZ_BY_ID(quizId),
            });
            // Invalidate lesson and course quizzes if available
            if (quiz?.lessonId) {
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.ASSESSMENTS.QUIZZES_BY_LESSON(quiz.lessonId),
                });
            }
            if (quiz?.courseId) {
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.ASSESSMENTS.QUIZZES_BY_COURSE(quiz.courseId),
                });
            }
        },
    });
};

/**
 * Delete a quiz
 */
export const useDeleteQuiz = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ quizId, lessonId, courseId }: { quizId: string; lessonId?: string; courseId?: string }) =>
            quizApi.delete(quizId),
        onSuccess: (_, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.ASSESSMENTS.QUIZ_BY_ID(variables.quizId),
            });
            if (variables.lessonId) {
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.ASSESSMENTS.QUIZZES_BY_LESSON(variables.lessonId),
                });
            }
            if (variables.courseId) {
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.ASSESSMENTS.QUIZZES_BY_COURSE(variables.courseId),
                });
            }
        },
    });
};

/**
 * Add a question to quiz
 */
export const useAddQuizQuestion = (quizId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (question: Omit<IQuizQuestion, "_id">) => quizApi.addQuestion(quizId, question),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.ASSESSMENTS.QUIZ_BY_ID(quizId),
            });
        },
    });
};

/**
 * Update a quiz question
 */
export const useUpdateQuizQuestion = (quizId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ questionId, question }: { questionId: string; question: Partial<IQuizQuestion> }) =>
            quizApi.updateQuestion(quizId, questionId, question),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.ASSESSMENTS.QUIZ_BY_ID(quizId),
            });
        },
    });
};

/**
 * Remove a quiz question
 */
export const useRemoveQuizQuestion = (quizId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (questionId: string) => quizApi.removeQuestion(quizId, questionId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.ASSESSMENTS.QUIZ_BY_ID(quizId),
            });
        },
    });
};

// ============================================
// ASSIGNMENT MUTATIONS
// ============================================

/**
 * Create a new assignment
 */
export const useCreateAssignment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAssignmentDTO) => assignmentApi.create(data),
        onSuccess: (_, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.ASSESSMENTS.ASSIGNMENTS_BY_LESSON(variables.lessonId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.ASSESSMENTS.ASSIGNMENTS_BY_COURSE(variables.courseId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.ASSESSMENTS.UPCOMING_ASSIGNMENTS(variables.courseId),
            });
        },
    });
};

/**
 * Update an assignment
 */
export const useUpdateAssignment = (assignmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateAssignmentDTO) => assignmentApi.update(assignmentId, data),
        onSuccess: (response) => {
            const assignment = response.data;
            // Invalidate specific assignment query
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.ASSESSMENTS.ASSIGNMENT_BY_ID(assignmentId),
            });
            // Invalidate lesson and course assignments if available
            if (assignment?.lessonId) {
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.ASSESSMENTS.ASSIGNMENTS_BY_LESSON(assignment.lessonId),
                });
            }
            if (assignment?.courseId) {
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.ASSESSMENTS.ASSIGNMENTS_BY_COURSE(assignment.courseId),
                });
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.ASSESSMENTS.UPCOMING_ASSIGNMENTS(assignment.courseId),
                });
            }
        },
    });
};

/**
 * Delete an assignment
 */
export const useDeleteAssignment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            assignmentId,
            lessonId,
            courseId,
        }: {
            assignmentId: string;
            lessonId?: string;
            courseId?: string;
        }) => assignmentApi.delete(assignmentId),
        onSuccess: (_, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.ASSESSMENTS.ASSIGNMENT_BY_ID(variables.assignmentId),
            });
            if (variables.lessonId) {
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.ASSESSMENTS.ASSIGNMENTS_BY_LESSON(variables.lessonId),
                });
            }
            if (variables.courseId) {
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.ASSESSMENTS.ASSIGNMENTS_BY_COURSE(variables.courseId),
                });
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.ASSESSMENTS.UPCOMING_ASSIGNMENTS(variables.courseId),
                });
            }
        },
    });
};
