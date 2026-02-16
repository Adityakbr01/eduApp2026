import express from "express";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import studentRouter from "./student.routes.js";
import instructorRouter from "./instructor.routes.js";

const router = express.Router();

router.use(authMiddleware);

// Student Routes (Default)
router.use("/", studentRouter);

// Instructor Routes
router.use("/instructor", instructorRouter);

export default router;
