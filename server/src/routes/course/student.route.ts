import { Router } from "express";
import { ROLES } from "src/constants/roles.js";
import { contentProgressController } from "src/controllers/progress/contentProgress.controller.js";
import { courseProgressController } from "src/controllers/progress/courseProgress.controller.js";
import { validateRequest } from "src/middlewares/custom/validateRequest.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkRole from "src/middlewares/system/checkRole.js";
import {
    markCompletedSchema,
    saveProgressSchema,
    updateResumeSchema,
} from "src/schemas/course.schema.js";

const studentRouter = Router();

studentRouter.use(authMiddleware);
studentRouter.use(checkRole(ROLES.STUDENT.code));

// Content Progress
studentRouter.post("/content/:contentId/progress", validateRequest(saveProgressSchema), contentProgressController.saveProgress);
studentRouter.get("/content/:contentId/progress", contentProgressController.getProgress);
studentRouter.put("/content/:contentId/complete", validateRequest(markCompletedSchema), contentProgressController.markCompleted);
studentRouter.put("/content/:contentId/resume", validateRequest(updateResumeSchema), contentProgressController.updateResumePosition);

// 🔥 AGGREGATION API - Full Course with Progress
studentRouter.get("/:courseId/progress", courseProgressController.getCourseWithProgress);
studentRouter.get("/:courseId/resume", courseProgressController.getResumeInfo);

export default studentRouter;
