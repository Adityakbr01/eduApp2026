import apiClient from "@/lib/api/axios";

// ==================== ASSESSMENT API ====================

export const assessmentApi = {
    /**
     * Submit a single quiz question
     * POST /assessments/student/quiz/:quizId/question/submit
     */
    submitQuizQuestion: async (
        quizId: string,
        data: { questionId: string; selectedOptionIndex: number }
    ) => {
        const response = await apiClient.post(
            `/assessments/student/quiz/${quizId}/question/submit`,
            data
        );
        return response.data;
    },

    /**
     * Get student's quiz attempt (previous results)
     * GET /assessments/student/quiz/:quizId/attempt
     */
    getQuizAttempt: async (quizId: string) => {
        const response = await apiClient.get(
            `/assessments/student/quiz/${quizId}/attempt`
        );
        return response.data;
    },

    /**
     * Get quiz for student (hides answers)
     * GET /assessments/student/quiz/:quizId/student
     */
    getQuizForStudent: async (quizId: string) => {
        const response = await apiClient.get(
            `/assessments/student/quiz/${quizId}/student`
        );
        return response.data;
    },

    /**
     * Submit an assignment
     * POST /assessments/student/assignment/:assignmentId/submit
     */
    submitAssignment: async (
        assignmentId: string,
        data: {
            submissionType: "file" | "text" | "link" | "code";
            fileUrl?: string;
            textContent?: string;
            linkUrl?: string;
            codeContent?: string;
            codeLanguage?: string;
        }
    ) => {
        const response = await apiClient.post(
            `/assessments/student/assignment/${assignmentId}/submit`,
            data
        );
        return response.data;
    },

    /**
     * Get student's assignment submission
     * GET /assessments/student/assignment/:assignmentId/submission
     */
    getAssignmentSubmission: async (assignmentId: string) => {
        const response = await apiClient.get(
            `/assessments/student/assignment/${assignmentId}/submission`
        );
        return response.data;
    },

    // ==================== INSTRUCTOR API ====================

    /**
     * Get all assignments with submission counts (Instructor)
     * GET /assessments/instructor/assignments
     */
    getAssignmentsForGrading: async () => {
        const response = await apiClient.get(
            `/assessments/instructor/assignments`
        );
        return response.data;
    },

    /**
     * Get all submissions for an assignment (Instructor)
     * GET /assessments/instructor/assignment/:assignmentId/submissions
     */
    getSubmissions: async (assignmentId: string) => {
        const response = await apiClient.get(
            `/assessments/instructor/assignment/${assignmentId}/submissions`
        );
        return response.data;
    },

    /**
     * Grade a student's submission (Instructor)
     * PUT /assessments/instructor/assignment/submission/:submissionId/grade
     */
    gradeSubmission: async (
        submissionId: string,
        data: { obtainedMarks: number; feedback?: string }
    ) => {
        const response = await apiClient.put(
            `/assessments/instructor/assignment/submission/${submissionId}/grade`,
            data
        );
        return response.data;
    },
};
