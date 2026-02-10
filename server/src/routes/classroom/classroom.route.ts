import { Router } from "express";
import { classroomController } from "src/controllers/classroom/classroom.controller.js";
import { batchController } from "src/controllers/classroom/batch.controller.js";
import { instructorController } from "src/controllers/classroom/instructor.controller.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkRole from "src/middlewares/system/checkRole.js";
import { isEnrolled } from "src/middlewares/custom/isEnrolled.js";
import { ROLES } from "src/constants/roles.js";

const router = Router();

// ============================================
// 🔐 AUTH MIDDLEWARE
// ============================================
router.use(authMiddleware);

// ============================================
// 📚 CLASSROOM ROUTES (STUDENT)
// ============================================

/**
 * @route   GET /api/classroom
 * @desc    Get classroom data (enrolled courses with progress)
 * @access  Private (Authenticated users)
 */
router.get("/", classroomController.getClassroomData);

/**
 * @route   GET /api/classroom/:courseId/batch
 * @desc    Get batch detail (sections, lessons, contents with progress/deadline/penalty)
 * @access  Private (Enrolled users only)
 */
router.get("/:courseId/batch", isEnrolled(), batchController.getBatchDetail);

/**
 * @route   GET /api/classroom/:courseId/content/:contentId
 * @desc    Get content detail (video URL, PDF URL, audio URL, etc.)
 * @access  Private (Enrolled users only)
 */
router.get("/:courseId/content/:contentId", isEnrolled(), batchController.getContentDetail);

// ============================================
// 🎓 INSTRUCTOR ROUTES
// ============================================

/**
 * @route   PUT /api/classroom/:courseId/section/:sectionId/unlock
 * @desc    Manually unlock/lock a section
 * @access  Private (Instructor only)
 */
router.put(
    "/:courseId/section/:sectionId/unlock",
    checkRole(ROLES.INSTRUCTOR.code),
    instructorController.toggleSectionUnlock,
);

/**
 * @route   PUT /api/classroom/:courseId/lesson/:lessonId/unlock
 * @desc    Manually unlock/lock a lesson
 * @access  Private (Instructor only)
 */
router.put(
    "/:courseId/lesson/:lessonId/unlock",
    checkRole(ROLES.INSTRUCTOR.code),
    instructorController.toggleLessonUnlock,
);

/**
 * @route   PUT /api/classroom/:courseId/content/:contentId/deadline
 * @desc    Update content deadline/penalty settings
 * @access  Private (Instructor only)
 */
router.put(
    "/:courseId/content/:contentId/deadline",
    checkRole(ROLES.INSTRUCTOR.code),
    instructorController.updateContentDeadline,
);

export default router;
