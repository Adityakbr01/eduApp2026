import { Router } from "express";
import { ROLES } from "src/constants/roles.js";
import courseController from "src/controllers/course.controller.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkRole from "src/middlewares/system/checkRole.js";

const adminRouter = Router();

adminRouter.use(authMiddleware);
adminRouter.use(checkRole(ROLES.ADMIN.code));

// GET COURSES FOR ADMIN WITH PAGINATION AND FILTERING
adminRouter.get("/", courseController.GetCourseForAdmin);
adminRouter.put("/course-status-requests/:requestId/review", courseController.toggleCourseStatusAdmin);

// toggle course IsFeatured
adminRouter.put("/:id/toggleFeatured", courseController.toggleFeaturedCourse);

// Reorder courses
adminRouter.put("/reorder-courses", courseController.reorderCourses);

export default adminRouter;
