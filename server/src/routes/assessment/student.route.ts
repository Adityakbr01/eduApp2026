import { Router } from "express";
import { ROLES } from "src/constants/roles.js";
import { quizController } from "src/controllers/assessment.controller.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkRole from "src/middlewares/system/checkRole.js";

const studentRouter = Router();

studentRouter.use(authMiddleware);

// Student route for quiz
studentRouter.get("/quiz/:quizId/student", checkRole(ROLES.STUDENT.code), quizController.getQuizForStudent);

export default studentRouter;
