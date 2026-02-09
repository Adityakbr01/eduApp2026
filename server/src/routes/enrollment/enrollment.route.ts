import { Router } from "express";
import { enrollmentController } from "src/controllers/enrollment/enrollment.controller.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";

const router = Router();

// ============================================
// 🔐 AUTH MIDDLEWARE FOR ALL ROUTES
// ============================================
router.use(authMiddleware);

// ============================================
// 📚 ENROLLMENT ROUTES
// ============================================

/**
 * @route   POST /api/enroll/:courseId
 * @desc    Enroll in a free course
 * @access  Private (Authenticated users)
 */
router.post("/enroll/:courseId", enrollmentController.enrollInCourse);

/**
 * @route   GET /api/enroll/:courseId/status
 * @desc    Check enrollment status for a course
 * @access  Private (Authenticated users)
 */
router.get("/enroll/:courseId/status", enrollmentController.checkEnrollmentStatus);

/**
 * @route   GET /api/my-courses
 * @desc    Get all courses the user is enrolled in
 * @access  Private (Authenticated users)
 */
router.get("/my-courses", enrollmentController.getMyEnrolledCourses);


export default router;