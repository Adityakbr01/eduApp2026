import { Router } from "express";
import { ROLES } from "src/constants/roles.js";
import { quizController, assignmentController } from "src/controllers/assessment.controller.js";
import { validateRequest } from "src/middlewares/custom/validateRequest.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkRole from "src/middlewares/system/checkRole.js";
import {
    createQuizSchema,
    updateQuizSchema,
    addQuestionSchema,
    updateQuestionSchema,
    createAssignmentSchema,
    updateAssignmentSchema,
} from "src/schemas/assessment.schema.js";

const router = Router();

// ============================================
// 🔐 AUTH MIDDLEWARE FOR ALL ROUTES
// ============================================
router.use(authMiddleware);

// ============================================
// 📝 QUIZ ROUTES
// ============================================

// Instructor routes for quiz management
const quizInstructorRouter = Router();
quizInstructorRouter.use(checkRole(ROLES.INSTRUCTOR.code, ROLES.ADMIN.code));

// CRUD operations
quizInstructorRouter.post("/", validateRequest(createQuizSchema), quizController.createQuiz);
quizInstructorRouter.get("/:quizId", quizController.getQuizById);
quizInstructorRouter.get("/content/:contentId", quizController.getQuizByContentId);
quizInstructorRouter.get("/lesson/:lessonId", quizController.getQuizzesByLesson);
quizInstructorRouter.get("/course/:courseId", quizController.getQuizzesByCourse);
quizInstructorRouter.put("/:quizId", validateRequest(updateQuizSchema), quizController.updateQuiz);
quizInstructorRouter.delete("/:quizId", quizController.deleteQuiz);

// Question management
quizInstructorRouter.post("/:quizId/question", validateRequest(addQuestionSchema), quizController.addQuestion);
quizInstructorRouter.put("/:quizId/question/:questionId", validateRequest(updateQuestionSchema), quizController.updateQuestion);
quizInstructorRouter.delete("/:quizId/question/:questionId", quizController.removeQuestion);

// Student route for quiz
router.get("/quiz/:quizId/student", checkRole(ROLES.STUDENT.code), quizController.getQuizForStudent);

// Mount instructor quiz routes
router.use("/quiz", quizInstructorRouter);

// ============================================
// 📋 ASSIGNMENT ROUTES
// ============================================

// Instructor routes for assignment management
const assignmentInstructorRouter = Router();
assignmentInstructorRouter.use(checkRole(ROLES.INSTRUCTOR.code, ROLES.ADMIN.code));

// CRUD operations
assignmentInstructorRouter.post("/", validateRequest(createAssignmentSchema), assignmentController.createAssignment);
assignmentInstructorRouter.get("/:assignmentId", assignmentController.getAssignmentById);
assignmentInstructorRouter.get("/content/:contentId", assignmentController.getAssignmentByContentId);
assignmentInstructorRouter.get("/lesson/:lessonId", assignmentController.getAssignmentsByLesson);
assignmentInstructorRouter.get("/course/:courseId", assignmentController.getAssignmentsByCourse);
assignmentInstructorRouter.get("/course/:courseId/upcoming", assignmentController.getUpcomingAssignments);
assignmentInstructorRouter.put("/:assignmentId", validateRequest(updateAssignmentSchema), assignmentController.updateAssignment);
assignmentInstructorRouter.delete("/:assignmentId", assignmentController.deleteAssignment);

// Mount instructor assignment routes
router.use("/assignment", assignmentInstructorRouter);

export default router;
