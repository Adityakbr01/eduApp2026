import { Router } from "express";
import { ROLES } from "src/constants/roles.js";
import { contentProgressController } from "src/controllers/contentProgress.Controller.js";
import courseController from "src/controllers/course.controller.js";
import { courseProgressController } from "src/controllers/courseProgress.Controller.js";
import { lessonController } from "src/controllers/lesson.Controller.js";
import { lessonContentController } from "src/controllers/lessonContent.Controller.js";
import { sectionController } from "src/controllers/section.Controller.js";
import { validateRequest } from "src/middlewares/custom/validateRequest.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkRole from "src/middlewares/system/checkRole.js";
import {
    createContentSchema,
    createCourseSchema,
    createLessonSchema,
    createSectionSchema,
    markCompletedSchema,
    reorderContentsSchema,
    reorderLessonsSchema,
    reorderSectionsSchema,
    saveProgressSchema,
    updateContentSchema,
    updateCourseSchema,
    updateLessonSchema,
    updateResumeSchema,
    updateSectionSchema,
} from "src/schemas/course.schema.js";

const router = Router();

// ============================================
// 🔐 AUTH MIDDLEWARE FOR ALL ROUTES (except public routes below)
// ============================================

// ============================================
// 🎓 INSTRUCTOR ROUTES (Protected by Role)
// ============================================
const instructorRouter = Router();
instructorRouter.use(authMiddleware);
instructorRouter.use(checkRole(ROLES.INSTRUCTOR.code));

// 1️⃣ COURSE CRUD
instructorRouter.post("/", validateRequest(createCourseSchema), courseController.createCourse);
instructorRouter.get("/", courseController.getInstructorCourses);
instructorRouter.get("/:id", courseController.getCourseById);
instructorRouter.put("/:id", validateRequest(updateCourseSchema), courseController.updateCourse);
instructorRouter.delete("/:id", courseController.deleteCourse);
// 2️⃣ SECTION CRUD (Course ke andar)
instructorRouter.post("/:courseId/section", validateRequest(createSectionSchema), sectionController.createSection);
instructorRouter.get("/:courseId/section", sectionController.getSectionsByCourse);
instructorRouter.put("/section/:id", validateRequest(updateSectionSchema), sectionController.updateSection);
instructorRouter.delete("/section/:id", sectionController.deleteSection);

// 3️⃣ LESSON CRUD (Section ke andar)
instructorRouter.post("/section/:sectionId/lesson", validateRequest(createLessonSchema), lessonController.createLesson);
instructorRouter.get("/section/:sectionId/lesson", lessonController.getLessonsBySection);
instructorRouter.put("/lesson/:id", validateRequest(updateLessonSchema), lessonController.updateLesson);
instructorRouter.delete("/lesson/:id", lessonController.deleteLesson);

// 4️⃣ LESSON CONTENT CRUD (🔥 MOST IMPORTANT)
instructorRouter.post("/lesson/:lessonId/content", validateRequest(createContentSchema), lessonContentController.createContent);
instructorRouter.get("/lesson/:lessonId/content", lessonContentController.getContentsByLesson);
instructorRouter.put("/content/:id", validateRequest(updateContentSchema), lessonContentController.updateContent);
instructorRouter.delete("/content/:id", lessonContentController.deleteContent);

// 5️⃣ REORDERING SECTIONS
instructorRouter.put("/:courseId/sections/reorder", validateRequest(reorderSectionsSchema), sectionController.reorderSections);

// 6️⃣ REORDER LESSONS
instructorRouter.put("/section/:sectionId/lessons/reorder", validateRequest(reorderLessonsSchema), lessonController.reorderLessons);

// 7️⃣ REORDER CONTENTS
instructorRouter.put("/lesson/:lessonId/contents/reorder", validateRequest(reorderContentsSchema), lessonContentController.reorderContents);

// 8️⃣ PUBLISH & UNPUBLISH COURSE
instructorRouter.put("/:id/toggleCourseStatus", courseController.togglePublishCourse);

// 9️⃣ TOGGLE VISIBILITY OF SECTION, LESSONS & CONTENT
instructorRouter.put("/section/:id/visibility", sectionController.toggleVisibility);
instructorRouter.put("/lesson/:id/visibility", lessonController.toggleVisibility);
instructorRouter.put("/content/:id/visibility", lessonContentController.toggleVisibility);

// Mount instructor routes
router.use("/instructor", instructorRouter);


// mount admin routes

const adminRouter = Router();
adminRouter.use(authMiddleware);
adminRouter.use(checkRole(ROLES.ADMIN.code));

// GET COURSES FOR ADMIN WITH PAGINATION AND FILTERING
adminRouter.get("/", courseController.GetCourseForAdmin);
adminRouter.put("/course-status-requests/:requestId/review", courseController.toggleCourseStatusAdmin);

router.use("/admin", adminRouter);

// ============================================
// 👨‍🎓 STUDENT ROUTES - PROGRESS TRACKING
// ============================================
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

// Mount student routes
router.use("/student", studentRouter);

// ============================================
// 🌐 PUBLIC ROUTES (No auth required)
// These must be AFTER subrouters to avoid matching "instructor" or "student" as :id
// ============================================
router.get("/", courseController.getAllPublishedCourses);
router.get("/:id", courseController.getPublishedCourseById);

export default router;