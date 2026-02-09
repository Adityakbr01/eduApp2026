import { Router } from "express";
import instructorRouter from "./instructor.route.js";
import studentRouter from "./student.route.js";

const router = Router();

// Mount routes
router.use("/", instructorRouter); // Handles /quiz and /assignment prefixed routes
router.use("/", studentRouter);    // Handles student specific routes

export default router;
