import { Router } from "express";
import { ROLES } from "src/constants/roles.js";
import { quizController, assignmentController } from "src/controllers/assessment/assessment.controller.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkRole from "src/middlewares/system/checkRole.js";

const studentRouter = Router();

studentRouter.use(authMiddleware);

// Student route for quiz
studentRouter.get("/quiz/:quizId/student", checkRole(ROLES.STUDENT.code), quizController.getQuizForStudent);

// Student route for getting quiz attempt (previous results)
studentRouter.get(
    "/quiz/:quizId/attempt",
    checkRole(ROLES.STUDENT.code, ROLES.INSTRUCTOR.code),
    quizController.getQuizAttempt
);

// Student route for submitting quiz question
studentRouter.post(
    "/quiz/:quizId/question/submit",
    checkRole(ROLES.STUDENT.code, ROLES.INSTRUCTOR.code),
    quizController.submitQuestion
);

// Student route for submitting quiz (finish attempt)
studentRouter.post(
    "/quiz/:quizId/submit",
    checkRole(ROLES.STUDENT.code, ROLES.INSTRUCTOR.code),
    quizController.submitQuiz
);

// Student route for getting assignment submission
studentRouter.get(
    "/assignment/:assignmentId/submission",
    checkRole(ROLES.STUDENT.code, ROLES.INSTRUCTOR.code),
    assignmentController.getAssignmentSubmission
);

// Student route for submitting assignment
studentRouter.post(
    "/assignment/:assignmentId/submit",
    checkRole(ROLES.STUDENT.code, ROLES.INSTRUCTOR.code),
    assignmentController.submitAssignment
);

export default studentRouter;
