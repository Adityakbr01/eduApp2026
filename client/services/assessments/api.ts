import apiClient from "@/lib/api/axios";
import type {
    IQuiz,
    IAssignment,
    CreateQuizDTO,
    UpdateQuizDTO,
    CreateAssignmentDTO,
    UpdateAssignmentDTO,
    IQuizQuestion,
} from "./types";

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// ============================================
// QUIZ API
// ============================================
export const quizApi = {
    // Create a new quiz
    create: async (data: CreateQuizDTO): Promise<ApiResponse<IQuiz>> => {
        const response = await apiClient.post<ApiResponse<IQuiz>>(
            "/assessments/quiz",
            data
        );
        return response.data;
    },

    // Get quiz by ID
    getById: async (quizId: string): Promise<ApiResponse<IQuiz>> => {
        const response = await apiClient.get<ApiResponse<IQuiz>>(
            `/assessments/quiz/${quizId}`
        );
        return response.data;
    },

    // Get quiz by content ID
    getByContentId: async (contentId: string): Promise<ApiResponse<IQuiz>> => {
        const response = await apiClient.get<ApiResponse<IQuiz>>(
            `/assessments/quiz/content/${contentId}`
        );
        return response.data;
    },

    // Get quizzes by lesson
    getByLesson: async (lessonId: string): Promise<ApiResponse<IQuiz[]>> => {
        const response = await apiClient.get<ApiResponse<IQuiz[]>>(
            `/assessments/quiz/lesson/${lessonId}`
        );
        return response.data;
    },

    // Get quizzes by course
    getByCourse: async (courseId: string): Promise<ApiResponse<IQuiz[]>> => {
        const response = await apiClient.get<ApiResponse<IQuiz[]>>(
            `/assessments/quiz/course/${courseId}`
        );
        return response.data;
    },

    // Get quiz for student (hides answers based on settings)
    getForStudent: async (quizId: string): Promise<ApiResponse<IQuiz>> => {
        const response = await apiClient.get<ApiResponse<IQuiz>>(
            `/assessments/quiz/${quizId}/student`
        );
        return response.data;
    },

    // Update quiz
    update: async (quizId: string, data: UpdateQuizDTO): Promise<ApiResponse<IQuiz>> => {
        const response = await apiClient.put<ApiResponse<IQuiz>>(
            `/assessments/quiz/${quizId}`,
            data
        );
        return response.data;
    },

    // Delete quiz
    delete: async (quizId: string): Promise<ApiResponse<null>> => {
        const response = await apiClient.delete<ApiResponse<null>>(
            `/assessments/quiz/${quizId}`
        );
        return response.data;
    },

    // Add question to quiz
    addQuestion: async (
        quizId: string,
        question: Omit<IQuizQuestion, "_id">
    ): Promise<ApiResponse<IQuiz>> => {
        const response = await apiClient.post<ApiResponse<IQuiz>>(
            `/assessments/quiz/${quizId}/question`,
            question
        );
        return response.data;
    },

    // Update question in quiz
    updateQuestion: async (
        quizId: string,
        questionId: string,
        question: Partial<IQuizQuestion>
    ): Promise<ApiResponse<IQuiz>> => {
        const response = await apiClient.put<ApiResponse<IQuiz>>(
            `/assessments/quiz/${quizId}/question/${questionId}`,
            question
        );
        return response.data;
    },

    // Remove question from quiz
    removeQuestion: async (quizId: string, questionId: string): Promise<ApiResponse<IQuiz>> => {
        const response = await apiClient.delete<ApiResponse<IQuiz>>(
            `/assessments/quiz/${quizId}/question/${questionId}`
        );
        return response.data;
    },
};

// ============================================
// ASSIGNMENT API
// ============================================
export const assignmentApi = {
    // Create a new assignment
    create: async (data: CreateAssignmentDTO): Promise<ApiResponse<IAssignment>> => {
        const response = await apiClient.post<ApiResponse<IAssignment>>(
            "/assessments/assignment",
            data
        );
        return response.data;
    },

    // Get assignment by ID
    getById: async (assignmentId: string): Promise<ApiResponse<IAssignment>> => {
        const response = await apiClient.get<ApiResponse<IAssignment>>(
            `/assessments/assignment/${assignmentId}`
        );
        return response.data;
    },

    // Get assignment by content ID
    getByContentId: async (contentId: string): Promise<ApiResponse<IAssignment>> => {
        const response = await apiClient.get<ApiResponse<IAssignment>>(
            `/assessments/assignment/content/${contentId}`
        );
        return response.data;
    },

    // Get assignments by lesson
    getByLesson: async (lessonId: string): Promise<ApiResponse<IAssignment[]>> => {
        const response = await apiClient.get<ApiResponse<IAssignment[]>>(
            `/assessments/assignment/lesson/${lessonId}`
        );
        return response.data;
    },

    // Get assignments by course
    getByCourse: async (courseId: string): Promise<ApiResponse<IAssignment[]>> => {
        const response = await apiClient.get<ApiResponse<IAssignment[]>>(
            `/assessments/assignment/course/${courseId}`
        );
        return response.data;
    },

    // Get upcoming assignments by course
    getUpcoming: async (courseId: string): Promise<ApiResponse<IAssignment[]>> => {
        const response = await apiClient.get<ApiResponse<IAssignment[]>>(
            `/assessments/assignment/course/${courseId}/upcoming`
        );
        return response.data;
    },

    // Update assignment
    update: async (
        assignmentId: string,
        data: UpdateAssignmentDTO
    ): Promise<ApiResponse<IAssignment>> => {
        const response = await apiClient.put<ApiResponse<IAssignment>>(
            `/assessments/assignment/${assignmentId}`,
            data
        );
        return response.data;
    },

    // Delete assignment
    delete: async (assignmentId: string): Promise<ApiResponse<null>> => {
        const response = await apiClient.delete<ApiResponse<null>>(
            `/assessments/assignment/${assignmentId}`
        );
        return response.data;
    },
};
