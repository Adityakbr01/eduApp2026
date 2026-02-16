import express from "express";
import { API_PREFIX } from "src/constants/api.js";
import rootRouter from "./root.route.js";
import authRouter from "./auth/index.js";
import userRouter from "./user/index.js";
import courseRouter from "./course/index.js";
import categoryRouter from "./category/index.js";
import assessmentRouter from "./assessment/index.js";
import enrollmentRouter from "./enrollment/index.js";
import paymentRouter from "./payment/index.js";
import reviewRouter from "./review/index.js";
import aiRouter from "./ai/index.js";
import uploadRouter from "./upload/index.js";
import communicationRouter from "./communication/index.js";
import systemRouter from "./system/index.js";
import userPreferenceRouter from "./preferences/index.js";
import classroomRouter from "./classroom/index.js";
import notificationRouter from "./notification/index.js";

const router = express.Router();

// Root
router.use(`${API_PREFIX}/`, rootRouter);

// Auth
router.use(`${API_PREFIX}/auth`, authRouter);

// Users
router.use(`${API_PREFIX}/users`, userRouter);

// User Preferences
router.use(`${API_PREFIX}/preferences`, userPreferenceRouter);

// Courses
router.use(`${API_PREFIX}/courses`, courseRouter);

// Categories
router.use(`${API_PREFIX}/categories`, categoryRouter);

// Assessments
router.use(`${API_PREFIX}/assessments`, assessmentRouter);

// Enrollments
router.use(`${API_PREFIX}`, enrollmentRouter);

//Payments
router.use(`${API_PREFIX}/payments`, paymentRouter);

// Reviews
router.use(`${API_PREFIX}/reviews`, reviewRouter);

// AI
router.use(`${API_PREFIX}/ai`, aiRouter);

// Upload
router.use(`${API_PREFIX}/upload`, uploadRouter);

// Communication
router.use(`${API_PREFIX}/campaigns`, communicationRouter);

// System (monitoring, health)
router.use(`${API_PREFIX}`, systemRouter);

// Classroom
router.use(`${API_PREFIX}/classroom`, classroomRouter);

// Notifications
router.use(`${API_PREFIX}/notifications`, notificationRouter);

export default router;
