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
import { ApiResponse } from "../auth";



// ============================================
// QUIZ API
// ============================================


const instructorAssesmentBaseURL = "/assessments/instructor"

export const quizApi = {
    // Create a new quiz
    create: async (data: CreateQuizDTO): Promise<ApiResponse<IQuiz>> => {
        const response = await apiClient.post<ApiResponse<IQuiz>>(
            `${instructorAssesmentBaseURL}/quiz`,
            data
        );
        return response.data;
    },

    // Get quiz by ID
    getById: async (quizId: string): Promise<ApiResponse<IQuiz>> => {
        const response = await apiClient.get<ApiResponse<IQuiz>>(
            `${instructorAssesmentBaseURL}/quiz/${quizId}`
        );
        return response.data;
    },

    // Get quiz by content ID
    getByContentId: async (contentId: string): Promise<ApiResponse<IQuiz>> => {
        const response = await apiClient.get<ApiResponse<IQuiz>>(
            `${instructorAssesmentBaseURL}/quiz/content/${contentId}`
        );
        return response.data;
    },

    // Get quizzes by lesson
    getByLesson: async (lessonId: string): Promise<ApiResponse<IQuiz[]>> => {
        const response = await apiClient.get<ApiResponse<IQuiz[]>>(
            `${instructorAssesmentBaseURL}/quiz/lesson/${lessonId}`
        );
        return response.data;
    },

    // Get quizzes by course
    getByCourse: async (courseId: string): Promise<ApiResponse<IQuiz[]>> => {
        const response = await apiClient.get<ApiResponse<IQuiz[]>>(
            `${instructorAssesmentBaseURL}/quiz/course/${courseId}`
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
            `${instructorAssesmentBaseURL}/quiz/${quizId}`,
            data
        );
        return response.data;
    },

    // Delete quiz
    delete: async (quizId: string): Promise<ApiResponse<null>> => {
        const response = await apiClient.delete<ApiResponse<null>>(
            `${instructorAssesmentBaseURL}/quiz/${quizId}`
        );
        return response.data;
    },

    // Add question to quiz
    addQuestion: async (
        quizId: string,
        question: Omit<IQuizQuestion, "_id">
    ): Promise<ApiResponse<IQuiz>> => {
        const response = await apiClient.post<ApiResponse<IQuiz>>(
            `${instructorAssesmentBaseURL}/quiz/${quizId}/question`,
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
            `${instructorAssesmentBaseURL}/quiz/${quizId}/question/${questionId}`,
            question
        );
        return response.data;
    },

    // Remove question from quiz
    removeQuestion: async (quizId: string, questionId: string): Promise<ApiResponse<IQuiz>> => {
        const response = await apiClient.delete<ApiResponse<IQuiz>>(
            `${instructorAssesmentBaseURL}/quiz/${quizId}/question/${questionId}`
        );
        return response.data;
    },
    // Submit quiz question
    submitQuestion: async (
        quizId: string,
        data: { questionId: string; selectedOptionIndex: number }
    ): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            `/assessments/student/quiz/${quizId}/question/submit`,
            data
        );
        return response.data;
    },

    // Get quiz attempt (results)
    getAttempt: async (quizId: string): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            `/assessments/student/quiz/${quizId}/attempt`
        );
        return response.data;
    },
};

// ============================================
// ASSIGNMENT API
// ============================================
export const assignmentApi = {
    // Submit assignment
    submit: async (
        assignmentId: string,
        data: FormData | any
    ): Promise<ApiResponse<any>> => {
        const isFormData = data instanceof FormData;
        const config = isFormData
            ? {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
            : undefined;

        const response = await apiClient.post<ApiResponse<any>>(
            `/assessments/student/assignment/${assignmentId}/submit`,
            data,
            config
        );
        return response.data;
    },

    // Create a new assignment
    create: async (data: CreateAssignmentDTO): Promise<ApiResponse<IAssignment>> => {
        const response = await apiClient.post<ApiResponse<IAssignment>>(
            `${instructorAssesmentBaseURL}/assignment`,
            data
        );
        return response.data;
    },

    // Get assignment by ID
    getById: async (assignmentId: string): Promise<ApiResponse<IAssignment>> => {
        const response = await apiClient.get<ApiResponse<IAssignment>>(
            `${instructorAssesmentBaseURL}/assignment/${assignmentId}`
        );
        return response.data;
    },

    // Get assignment by content ID
    getByContentId: async (contentId: string): Promise<ApiResponse<IAssignment>> => {
        const response = await apiClient.get<ApiResponse<IAssignment>>(
            `${instructorAssesmentBaseURL}/assignment/content/${contentId}`
        );
        return response.data;
    },

    // Get assignments by lesson
    getByLesson: async (lessonId: string): Promise<ApiResponse<IAssignment[]>> => {
        const response = await apiClient.get<ApiResponse<IAssignment[]>>(
            `${instructorAssesmentBaseURL}/assignment/lesson/${lessonId}`
        );
        return response.data;
    },

    // Get assignments by course
    getByCourse: async (courseId: string): Promise<ApiResponse<IAssignment[]>> => {
        const response = await apiClient.get<ApiResponse<IAssignment[]>>(
            `${instructorAssesmentBaseURL}/assignment/course/${courseId}`
        );
        return response.data;
    },

    // Get upcoming assignments by course
    getUpcoming: async (courseId: string): Promise<ApiResponse<IAssignment[]>> => {
        const response = await apiClient.get<ApiResponse<IAssignment[]>>(
            `${instructorAssesmentBaseURL}/assignment/course/${courseId}/upcoming`
        );
        return response.data;
    },

    // Update assignment
    update: async (
        assignmentId: string,
        data: UpdateAssignmentDTO
    ): Promise<ApiResponse<IAssignment>> => {
        const response = await apiClient.put<ApiResponse<IAssignment>>(
            `${instructorAssesmentBaseURL}/assignment/${assignmentId}`,
            data
        );
        return response.data;
    },

    // Delete assignment
    delete: async (assignmentId: string): Promise<ApiResponse<null>> => {
        const response = await apiClient.delete<ApiResponse<null>>(
            `${instructorAssesmentBaseURL}/assignment/${assignmentId}`
        );
        return response.data;
    },
};
