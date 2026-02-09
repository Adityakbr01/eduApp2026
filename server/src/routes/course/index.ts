import { Router } from "express";
import adminRouter from "./admin.route.js";
import instructorRouter from "./instructor.route.js";
import studentRouter from "./student.route.js";
import publicRouter from "./public.route.js";

const router = Router();

// Mount routes
router.use("/instructor", instructorRouter);
router.use("/admin", adminRouter);
router.use("/student", studentRouter);

// Public routes MUST be mounted last to avoid collisions with param-based routes like /:id
router.use("/", publicRouter);

export default router;
