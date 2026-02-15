import type { Request, Response } from "express";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { SUCCESS_CODE } from "src/constants/successCodes.js";
import { quizService, assignmentService } from "src/services/assessment/assessment.service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";
import {
    createQuizSchema,
    updateQuizSchema,
    addQuestionSchema,
    updateQuestionSchema,
    createAssignmentSchema,
    updateAssignmentSchema,
    gradeAssignmentSchema,
    gradeAllSubmissionsSchema,
} from "src/schemas/assessment.schema.js";

// ============================================
// QUIZ CONTROLLER
// ============================================
export const quizController = {
    /**
     * @desc    Create a new quiz
     * @route   POST /api/v1/assessments/quiz
     * @access  Private (Instructor)
     */
    createQuiz: catchAsync(async (req: Request, res: Response) => {
        const validatedData = createQuizSchema.parse(req.body);
        const quiz = await quizService.createQuiz(validatedData);

        sendResponse(res, STATUSCODE.CREATED, SUCCESS_CODE.CREATED, quiz);
    }),

    /**
     * @desc    Get quiz by ID
     * @route   GET /api/v1/assessments/quiz/:quizId
     * @access  Private (Instructor)
     */
    getQuizById: catchAsync(async (req: Request, res: Response) => {
        const { quizId } = req.params;
        const quiz = await quizService.getQuizById(quizId);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, quiz);
    }),

    /**
     * @desc    Get quiz by content ID
     * @route   GET /api/v1/assessments/quiz/content/:contentId
     * @access  Private (Instructor)
     */
    getQuizByContentId: catchAsync(async (req: Request, res: Response) => {
        const { contentId } = req.params;
        const quiz = await quizService.getQuizByContentId(contentId);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, quiz);
    }),

    /**
     * @desc    Get quiz for student (hides correct answers based on settings)
     * @route   GET /api/v1/assessments/quiz/:quizId/student
     * @access  Private (Student)
     */
    getQuizForStudent: catchAsync(async (req: Request, res: Response) => {
        const { quizId } = req.params;
        const quiz = await quizService.getQuizForStudent(quizId);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, quiz);
    }),

    /**
     * @desc    Get quizzes by lesson
     * @route   GET /api/v1/assessments/quiz/lesson/:lessonId
     * @access  Private (Instructor)
     */
    getQuizzesByLesson: catchAsync(async (req: Request, res: Response) => {
        const { lessonId } = req.params;
        const quizzes = await quizService.getQuizzesByLesson(lessonId);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, quizzes);
    }),

    /**
     * @desc    Get quizzes by course
     * @route   GET /api/v1/assessments/quiz/course/:courseId
     * @access  Private (Instructor)
     */
    getQuizzesByCourse: catchAsync(async (req: Request, res: Response) => {
        const { courseId } = req.params;
        const quizzes = await quizService.getQuizzesByCourse(courseId);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, quizzes);
    }),

    /**
     * @desc    Update quiz
     * @route   PUT /api/v1/assessments/quiz/:quizId
     * @access  Private (Instructor)
     */
    updateQuiz: catchAsync(async (req: Request, res: Response) => {
        const { quizId } = req.params;
        const validatedData = updateQuizSchema.parse(req.body);
        const quiz = await quizService.updateQuiz(quizId, validatedData);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, quiz);
    }),

    /**
     * @desc    Delete quiz
     * @route   DELETE /api/v1/assessments/quiz/:quizId
     * @access  Private (Instructor)
     */
    deleteQuiz: catchAsync(async (req: Request, res: Response) => {
        const { quizId } = req.params;
        await quizService.deleteQuiz(quizId);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.DELETED, null);
    }),

    /**
     * @desc    Add question to quiz
     * @route   POST /api/v1/assessments/quiz/:quizId/question
     * @access  Private (Instructor)
     */
    addQuestion: catchAsync(async (req: Request, res: Response) => {
        const { quizId } = req.params;
        const validatedData = addQuestionSchema.parse(req.body);
        const quiz = await quizService.addQuestion(quizId, validatedData);

        sendResponse(res, STATUSCODE.CREATED, SUCCESS_CODE.CREATED, quiz);
    }),

    /**
     * @desc    Update question in quiz
     * @route   PUT /api/v1/assessments/quiz/:quizId/question/:questionId
     * @access  Private (Instructor)
     */
    updateQuestion: catchAsync(async (req: Request, res: Response) => {
        const { quizId, questionId } = req.params;
        const validatedData = updateQuestionSchema.parse(req.body);
        const quiz = await quizService.updateQuestion(quizId, questionId, validatedData);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, quiz);
    }),

    /**
     * @desc    Remove question from quiz
     * @route   DELETE /api/v1/assessments/quiz/:quizId/question/:questionId
     * @access  Private (Instructor)
     */
    removeQuestion: catchAsync(async (req: Request, res: Response) => {
        const { quizId, questionId } = req.params;
        const quiz = await quizService.removeQuestion(quizId, questionId);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.DELETED, quiz);
    }),

    /**
     * @desc    Submit quiz question
     * @route   POST /api/v1/assessments/student/quiz/:quizId/question/submit
     * @access  Private (Student)
     */
    submitQuestion: catchAsync(async (req: Request, res: Response) => {
        const { quizId } = req.params;
        const result = await quizService.submitQuestion(req.user.id, quizId, req.body);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result);
    }),

    /**
     * @desc    Get quiz attempt for student
     * @route   GET /api/v1/assessments/student/quiz/:quizId/attempt
     * @access  Private (Student)
     */
    getQuizAttempt: catchAsync(async (req: Request, res: Response) => {
        const { quizId } = req.params;
        const result = await quizService.getQuizAttempt(req.user.id, quizId);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result);
    }),
};

// ============================================
// ASSIGNMENT CONTROLLER
// ============================================
export const assignmentController = {
    /**
     * @desc    Create a new assignment
     * @route   POST /api/v1/assessments/assignment
     * @access  Private (Instructor)
     */
    createAssignment: catchAsync(async (req: Request, res: Response) => {
        const validatedData = createAssignmentSchema.parse(req.body);
        const assignment = await assignmentService.createAssignment(validatedData);

        sendResponse(res, STATUSCODE.CREATED, SUCCESS_CODE.CREATED, assignment);
    }),

    /**
     * @desc    Get assignment by ID
     * @route   GET /api/v1/assessments/assignment/:assignmentId
     * @access  Private (Instructor)
     */
    getAssignmentById: catchAsync(async (req: Request, res: Response) => {
        const { assignmentId } = req.params;
        const assignment = await assignmentService.getAssignmentById(assignmentId);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, assignment);
    }),

    /**
     * @desc    Get assignment by content ID
     * @route   GET /api/v1/assessments/assignment/content/:contentId
     * @access  Private (Instructor)
     */
    getAssignmentByContentId: catchAsync(async (req: Request, res: Response) => {
        const { contentId } = req.params;
        const assignment = await assignmentService.getAssignmentByContentId(contentId);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, assignment);
    }),

    /**
     * @desc    Get assignments by lesson
     * @route   GET /api/v1/assessments/assignment/lesson/:lessonId
     * @access  Private (Instructor)
     */
    getAssignmentsByLesson: catchAsync(async (req: Request, res: Response) => {
        const { lessonId } = req.params;
        const assignments = await assignmentService.getAssignmentsByLesson(lessonId);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, assignments);
    }),

    /**
     * @desc    Get assignments by course
     * @route   GET /api/v1/assessments/assignment/course/:courseId
     * @access  Private (Instructor)
     */
    getAssignmentsByCourse: catchAsync(async (req: Request, res: Response) => {
        const { courseId } = req.params;
        const assignments = await assignmentService.getAssignmentsByCourse(courseId);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, assignments);
    }),

    /**
     * @desc    Get upcoming assignments by course
     * @route   GET /api/v1/assessments/assignment/course/:courseId/upcoming
     * @access  Private
     */
    getUpcomingAssignments: catchAsync(async (req: Request, res: Response) => {
        const { courseId } = req.params;
        const assignments = await assignmentService.getUpcomingAssignments(courseId);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, assignments);
    }),

    /**
     * @desc    Update assignment
     * @route   PUT /api/v1/assessments/assignment/:assignmentId
     * @access  Private (Instructor)
     */
    updateAssignment: catchAsync(async (req: Request, res: Response) => {
        const { assignmentId } = req.params;
        const validatedData = updateAssignmentSchema.parse(req.body);
        const assignment = await assignmentService.updateAssignment(assignmentId, validatedData);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, assignment);
    }),

    /**
     * @desc    Delete assignment
     * @route   DELETE /api/v1/assessments/assignment/:assignmentId
     * @access  Private (Instructor)
     */
    deleteAssignment: catchAsync(async (req: Request, res: Response) => {
        const { assignmentId } = req.params;
        await assignmentService.deleteAssignment(assignmentId);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.DELETED, null);
    }),

    /**
     * @desc    Submit assignment
     * @route   POST /api/v1/assessments/student/assignment/:assignmentId/submit
     * @access  Private (Student)
     */
    submitAssignment: catchAsync(async (req: Request, res: Response) => {
        const { assignmentId } = req.params;
        const result = await assignmentService.submitAssignment(req.user.id, assignmentId, req.body);

        sendResponse(res, STATUSCODE.CREATED, SUCCESS_CODE.CREATED, result);
    }),

    /**
     * @desc    Get assignment submission for student
     * @route   GET /api/v1/assessments/student/assignment/:assignmentId/submission
     * @access  Private (Student)
     */
    getAssignmentSubmission: catchAsync(async (req: Request, res: Response) => {
        const { assignmentId } = req.params;
        const result = await assignmentService.getAssignmentSubmission(req.user.id, assignmentId);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result);
    }),

    /**
     * @desc    Get all assignments with submission counts (Instructor)
     * @route   GET /api/v1/assessments/instructor/assignments
     * @access  Private (Instructor)
     */
    getAssignmentsWithSubmissions: catchAsync(async (req: Request, res: Response) => {
        const result = await assignmentService.getAssignmentsWithSubmissions(req.user.id);
        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result);
    }),

    /**
     * @desc    Get all submissions for an assignment (Instructor)
     * @route   GET /api/v1/assessments/instructor/assignment/:assignmentId/submissions
     * @access  Private (Instructor)
     */
    getSubmissions: catchAsync(async (req: Request, res: Response) => {
        const { assignmentId } = req.params;
        const result = await assignmentService.getSubmissions(assignmentId);

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result);
    }),

    /**
     * @desc    Grade a student's assignment submission
     * @route   PUT /api/v1/assessments/instructor/assignment/submission/:submissionId/grade
     * @access  Private (Instructor)
     */
    gradeAssignment: catchAsync(async (req: Request, res: Response) => {
        const { submissionId } = req.params;
        const validatedData = gradeAssignmentSchema.parse(req.body);
        const result = await assignmentService.gradeAssignment(
            submissionId,
            req.user.id,
            validatedData,
        );

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result);
    }),

    /**
     * @desc    Grade all pending submissions for an assignment
     * @route   PUT /api/v1/assessments/instructor/assignment/:assignmentId/grade-all
     * @access  Private (Instructor)
     */
    gradeAllSubmissions: catchAsync(async (req: Request, res: Response) => {
        const { assignmentId } = req.params;
        const validatedData = gradeAllSubmissionsSchema.parse(req.body);
        const result = await assignmentService.gradeAllSubmissions(
            assignmentId,
            req.user.id,
            validatedData,
        );

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result);
    }),
};
