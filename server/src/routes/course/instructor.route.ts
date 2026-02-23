import { Router } from "express";
import { ROLES } from "src/constants/roles.js";
import courseController from "src/controllers/course/course.controller.js";
import { courseCouponController } from "src/controllers/course/courseCoupon.controller.js";
import { lessonController } from "src/controllers/course/lesson.controller.js";
import { lessonContentController } from "src/controllers/course/lessonContent.controller.js";
import { sectionController } from "src/controllers/course/section.controller.js";
import { validateRequest } from "src/middlewares/custom/validateRequest.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkRole from "src/middlewares/system/checkRole.js";
import {
    createContentSchema,
    createCouponSchema,
    updateCouponSchema,
    createCourseSchema,
    createLessonSchema,
    createSectionSchema,
    reorderContentsSchema,
    reorderLessonsSchema,
    reorderSectionsSchema,
    updateContentSchema,
    updateCourseSchema,
    updateLessonSchema,
    updateSectionSchema,
} from "src/schemas/course.schema.js";

const instructorRouter = Router();

instructorRouter.use(authMiddleware);
instructorRouter.use(checkRole(ROLES.INSTRUCTOR.code));

// 🔟 COUPON CRUD (Must be before /:id routes)
instructorRouter.post("/coupons", validateRequest(createCouponSchema), courseCouponController.createCoupon);
instructorRouter.get("/coupons", courseCouponController.getInstructorCoupons);
instructorRouter.put("/coupons/:id", validateRequest(updateCouponSchema), courseCouponController.updateCoupon);
instructorRouter.delete("/coupons/:id", courseCouponController.deleteCoupon);

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

export default instructorRouter;
