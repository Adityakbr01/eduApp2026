import { Router } from "express";
import instructorRouter from "./instructor.route.js";
import studentRouter from "./student.route.js";

const router = Router();

// Mount routes
router.use("/student", studentRouter); // Handles student specific routes
router.use("/instructor", instructorRouter); // Handles /quiz and /assignment prefixed routes

export default router;
