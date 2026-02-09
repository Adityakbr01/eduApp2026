import { Types } from "mongoose";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { quizRepository, assignmentRepository } from "src/repositories/assessment.repository.js";
import { lessonContentRepository } from "src/repositories/lessonContent.repository.js";
import AppError from "src/utils/AppError.js";
import type { IQuizQuestion } from "src/models/course/quiz.model.js";
import type {
    CreateQuizInput,
    UpdateQuizInput,
    CreateAssignmentInput,
    UpdateAssignmentInput,
} from "src/schemas/assessment.schema.js";

// ============================================
// QUIZ SERVICE
// ============================================
export const quizService = {
    // -------------------- CREATE QUIZ --------------------
    createQuiz: async (data: CreateQuizInput) => {
        // Verify content exists and is of type quiz
        const content = await lessonContentRepository.findById(data.contentId);
        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Check if quiz already exists for this content
        const existingQuiz = await quizRepository.findByContentId(data.contentId);
        if (existingQuiz) {
            throw new AppError(
                "Quiz already exists for this content",
                STATUSCODE.CONFLICT,
                ERROR_CODE.ALREADY_EXISTS
            );
        }

        // Calculate total marks from questions
        const totalMarks = data.questions.reduce((sum, q) => sum + (q.marks || 0), 0);

        const quiz = await quizRepository.create({
            ...data,
            totalMarks,
            type: "quiz",
        });

        // Update content with assessment reference
        await lessonContentRepository.updateById(data.contentId, {
            assessment: {
                refId: quiz._id.toString(),
                type: "quiz",
            },
        });

        return quiz;
    },

    // -------------------- GET QUIZ BY ID --------------------
    getQuizById: async (quizId: string) => {
        const quiz = await quizRepository.findById(quizId);
        if (!quiz) {
            throw new AppError("Quiz not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }
        return quiz;
    },

    // -------------------- GET QUIZ BY CONTENT ID --------------------
    getQuizByContentId: async (contentId: string) => {
        const quiz = await quizRepository.findByContentId(contentId);
        // Return null if not found (don't throw error - quiz may not be created yet)
        return quiz;
    },

    // -------------------- GET QUIZ FOR STUDENT --------------------
    getQuizForStudent: async (quizId: string) => {
        const quiz = await quizRepository.findForStudent(quizId);
        if (!quiz) {
            throw new AppError("Quiz not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }
        return quiz;
    },

    // -------------------- GET QUIZZES BY LESSON --------------------
    getQuizzesByLesson: async (lessonId: string) => {
        return quizRepository.findByLessonId(lessonId);
    },

    // -------------------- GET QUIZZES BY COURSE --------------------
    getQuizzesByCourse: async (courseId: string) => {
        return quizRepository.findByCourseId(courseId);
    },

    // -------------------- UPDATE QUIZ --------------------
    updateQuiz: async (quizId: string, data: UpdateQuizInput) => {
        const quiz = await quizRepository.findById(quizId);
        if (!quiz) {
            throw new AppError("Quiz not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // If questions are updated, recalculate total marks
        let updateData: any = { ...data };
        if (data.questions) {
            updateData.totalMarks = data.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
        }

        return quizRepository.update(quizId, updateData);
    },

    // -------------------- DELETE QUIZ --------------------
    deleteQuiz: async (quizId: string) => {
        const quiz = await quizRepository.findById(quizId);
        if (!quiz) {
            throw new AppError("Quiz not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Clear assessment reference from content
        await lessonContentRepository.updateById(quiz.contentId.toString(), {
            assessment: undefined,
        });

        return quizRepository.delete(quizId);
    },

    // -------------------- ADD QUESTION --------------------
    addQuestion: async (quizId: string, question: IQuizQuestion) => {
        const quiz = await quizRepository.findById(quizId);
        if (!quiz) {
            throw new AppError("Quiz not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        return quizRepository.addQuestion(quizId, question);
    },

    // -------------------- UPDATE QUESTION --------------------
    updateQuestion: async (quizId: string, questionId: string, questionData: Partial<IQuizQuestion>) => {
        const quiz = await quizRepository.findById(quizId);
        if (!quiz) {
            throw new AppError("Quiz not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const questionExists = quiz.questions.some((q) => q._id?.toString() === questionId);
        if (!questionExists) {
            throw new AppError("Question not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        return quizRepository.updateQuestion(quizId, questionId, questionData);
    },

    // -------------------- REMOVE QUESTION --------------------
    removeQuestion: async (quizId: string, questionId: string) => {
        const quiz = await quizRepository.findById(quizId);
        if (!quiz) {
            throw new AppError("Quiz not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        if (quiz.questions.length <= 1) {
            throw new AppError(
                "Quiz must have at least one question",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.INVALID_INPUT
            );
        }

        return quizRepository.removeQuestion(quizId, questionId);
    },
};

// ============================================
// ASSIGNMENT SERVICE
// ============================================
export const assignmentService = {
    // -------------------- CREATE ASSIGNMENT --------------------
    createAssignment: async (data: CreateAssignmentInput) => {
        // Verify content exists
        const content = await lessonContentRepository.findById(data.contentId);
        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Check if assignment already exists for this content
        const existingAssignment = await assignmentRepository.findByContentId(data.contentId);
        if (existingAssignment) {
            throw new AppError(
                "Assignment already exists for this content",
                STATUSCODE.CONFLICT,
                ERROR_CODE.ALREADY_EXISTS
            );
        }

        const assignment = await assignmentRepository.create({
            ...data,
            type: "assignment",
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        });

        // Update content with assessment reference
        await lessonContentRepository.updateById(data.contentId, {
            assessment: {
                refId: assignment._id.toString(),
                type: "assignment",
            },
        });

        return assignment;
    },

    // -------------------- GET ASSIGNMENT BY ID --------------------
    getAssignmentById: async (assignmentId: string) => {
        const assignment = await assignmentRepository.findById(assignmentId);
        if (!assignment) {
            throw new AppError("Assignment not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }
        return assignment;
    },

    // -------------------- GET ASSIGNMENT BY CONTENT ID --------------------
    getAssignmentByContentId: async (contentId: string) => {
        const assignment = await assignmentRepository.findByContentId(contentId);
        // Return null if not found (don't throw error - assignment may not be created yet)
        return assignment;
    },

    // -------------------- GET ASSIGNMENTS BY LESSON --------------------
    getAssignmentsByLesson: async (lessonId: string) => {
        return assignmentRepository.findByLessonId(lessonId);
    },

    // -------------------- GET ASSIGNMENTS BY COURSE --------------------
    getAssignmentsByCourse: async (courseId: string) => {
        return assignmentRepository.findByCourseId(courseId);
    },

    // -------------------- UPDATE ASSIGNMENT --------------------
    updateAssignment: async (assignmentId: string, data: UpdateAssignmentInput) => {
        const assignment = await assignmentRepository.findById(assignmentId);
        if (!assignment) {
            throw new AppError("Assignment not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const updateData: any = { ...data };
        if (data.dueDate) {
            updateData.dueDate = new Date(data.dueDate);
        }

        return assignmentRepository.update(assignmentId, updateData);
    },

    // -------------------- DELETE ASSIGNMENT --------------------
    deleteAssignment: async (assignmentId: string) => {
        const assignment = await assignmentRepository.findById(assignmentId);
        if (!assignment) {
            throw new AppError("Assignment not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Clear assessment reference from content
        await lessonContentRepository.updateById(assignment.contentId.toString(), {
            assessment: undefined,
        });

        return assignmentRepository.delete(assignmentId);
    },

    // -------------------- GET UPCOMING ASSIGNMENTS --------------------
    getUpcomingAssignments: async (courseId: string) => {
        return assignmentRepository.findUpcoming(courseId);
    },

    // -------------------- GET OVERDUE ASSIGNMENTS --------------------
    getOverdueAssignments: async (courseId: string) => {
        return assignmentRepository.findOverdue(courseId);
    },
};
