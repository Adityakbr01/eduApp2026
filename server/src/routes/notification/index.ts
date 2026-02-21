import express from "express";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import studentRouter from "./student.routes.js";
import instructorRouter from "./instructor.routes.js";
import pushNotificationRouter from "./pushNotification.route.js";

const router = express.Router();

router.use(authMiddleware);

// Student Routes (Default)
router.use("/", studentRouter);

// Instructor Routes
router.use("/instructor", instructorRouter);

// Push Notification Routes
router.use("/push", pushNotificationRouter);

export default router;
