import { Router } from "express";
import courseController from "src/controllers/course.controller.js";

const publicRouter = Router();

// ============================================
// 🌐 PUBLIC ROUTES (No auth required)
// These must be AFTER subrouters to avoid matching "instructor" or "student" as :id
// ============================================

publicRouter.get("/", courseController.getAllPublishedCourses);
publicRouter.get("/featured", courseController.getFeaturedCourses);
publicRouter.get("/:id", courseController.getPublishedCourseById);

export default publicRouter;
