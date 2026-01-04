import express from "express";
import { API_PREFIX } from "src/constants/api.js";
import healthRouter from "./health.route.js";
import authRouter from "./auth.route.js"
import userRouter from "./user.route.js";
import categoryRouter from "./category.route.js";
import courseRouter from "./course.route.js";
import enrollmentRouter from "./enrollment.route.js";
import uploadRouter from "./upload.route.js";
import assessmentRouter from "./assessment.route.js";
import reviewRouter from "./review.route.js";

const router = express.Router();
router.use(`${API_PREFIX}/health`, healthRouter);
router.use(`${API_PREFIX}/auth`, authRouter)
router.use(`${API_PREFIX}/users`, userRouter)
router.use(`${API_PREFIX}/upload`, uploadRouter) // Role management routes
router.use(`${API_PREFIX}/categories`, categoryRouter)
router.use(`${API_PREFIX}/courses`, courseRouter);
router.use(`${API_PREFIX}/assessments`, assessmentRouter); // Quiz & Assignment routes
router.use(`${API_PREFIX}/reviews`, reviewRouter); // Course review routes
router.use(`${API_PREFIX}`, enrollmentRouter); // Enrollment & Payment routes

export default router;
