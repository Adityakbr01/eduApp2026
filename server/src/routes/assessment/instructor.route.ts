import { Router } from "express";
import { ROLES } from "src/constants/roles.js";
import { assignmentController, quizController } from "src/controllers/assessment/assessment.controller.js";
import { validateRequest } from "src/middlewares/custom/validateRequest.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkRole from "src/middlewares/system/checkRole.js";
import {
    addQuestionSchema,
    createAssignmentSchema,
    createQuizSchema,
    updateAssignmentSchema,
    updateQuestionSchema,
    updateQuizSchema,
} from "src/schemas/assessment.schema.js";

const instructorRouter = Router();

instructorRouter.use(authMiddleware);
instructorRouter.use(checkRole(ROLES.INSTRUCTOR.code, ROLES.ADMIN.code));

// ============================================
// 📝 QUIZ ROUTES
// ============================================

// CRUD operations
instructorRouter.post("/quiz", validateRequest(createQuizSchema), quizController.createQuiz);
instructorRouter.get("/quiz/:quizId", quizController.getQuizById);
instructorRouter.get("/quiz/content/:contentId", quizController.getQuizByContentId);
instructorRouter.get("/quiz/lesson/:lessonId", quizController.getQuizzesByLesson);
instructorRouter.get("/quiz/course/:courseId", quizController.getQuizzesByCourse);
instructorRouter.put("/quiz/:quizId", validateRequest(updateQuizSchema), quizController.updateQuiz);
instructorRouter.delete("/quiz/:quizId", quizController.deleteQuiz);

// Question management
instructorRouter.post("/quiz/:quizId/question", validateRequest(addQuestionSchema), quizController.addQuestion);
instructorRouter.put("/quiz/:quizId/question/:questionId", validateRequest(updateQuestionSchema), quizController.updateQuestion);
instructorRouter.delete("/quiz/:quizId/question/:questionId", quizController.removeQuestion);

// ============================================
// 📋 ASSIGNMENT ROUTES
// ============================================

// CRUD operations
instructorRouter.post("/assignment", validateRequest(createAssignmentSchema), assignmentController.createAssignment);
instructorRouter.get("/assignment/:assignmentId", assignmentController.getAssignmentById);
instructorRouter.get("/assignment/content/:contentId", assignmentController.getAssignmentByContentId);
instructorRouter.get("/assignment/lesson/:lessonId", assignmentController.getAssignmentsByLesson);
instructorRouter.get("/assignment/course/:courseId", assignmentController.getAssignmentsByCourse);
instructorRouter.get("/assignment/course/:courseId/upcoming", assignmentController.getUpcomingAssignments);
instructorRouter.put("/assignment/:assignmentId", validateRequest(updateAssignmentSchema), assignmentController.updateAssignment);
instructorRouter.delete("/assignment/:assignmentId", assignmentController.deleteAssignment);

export default instructorRouter;
