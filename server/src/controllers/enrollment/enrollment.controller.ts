import { EnrollmentStatus } from "src/models/enrollment.model.js";
import { enrollmentService } from "src/services/enrollment/enrollment.service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";

// ============================================
// ENROLLMENT CONTROLLER
// ============================================
export const enrollmentController = {
    /**
     * Enroll in a free course
     * POST /api/enroll/:courseId
     */
    enrollInCourse: catchAsync<{ courseId: string }>(async (req, res) => {
        const userId = req.user!.id;
        const { courseId } = req.params;

        const result = await enrollmentService.enrollInCourse({
            courseId,
            userId,
        });

        sendResponse(res, 201, result.message, {
            enrollment: result.enrollment,
            requiresPayment: result.requiresPayment,
        });
    }),

    /**
     * Check enrollment status
     * GET /api/enroll/:courseId/status
     */
    checkEnrollmentStatus: catchAsync<{ courseId: string }>(async (req, res) => {
        const userId = req.user!.id;
        const { courseId } = req.params;

        const result = await enrollmentService.checkEnrollment(userId, courseId);

        sendResponse(res, 200, "Enrollment status retrieved", result);
    }),

    /**
     * Get my enrolled courses
     * GET /api/my-courses
     */
    getMyEnrolledCourses: catchAsync(async (req, res) => {
        const userId = req.user!.id;
        const { page, limit, status } = req.query as {
            page?: string;
            limit?: string;
            status?: EnrollmentStatus;
        };

        const result = await enrollmentService.getMyEnrolledCourses(userId, {
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            status,
        });

        sendResponse(res, 200, "Enrolled courses retrieved", result);
    }),

    /**
     * Get course enrollments (for instructor)
     * GET /api/courses/:courseId/enrollments
     */
    getCourseEnrollments: catchAsync<{ courseId: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const { courseId } = req.params;
        const { page, limit, status } = req.query as {
            page?: string;
            limit?: string;
            status?: EnrollmentStatus;
        };

        const result = await enrollmentService.getCourseEnrollments(
            courseId,
            instructorId,
            {
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                status,
            }
        );

        sendResponse(res, 200, "Course enrollments retrieved", result);
    }),

    /**
     * Get enrollment statistics (for instructor)
     * GET /api/courses/:courseId/enrollments/stats
     */
    getEnrollmentStats: catchAsync<{ courseId: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const { courseId } = req.params;

        const result = await enrollmentService.getEnrollmentStats(
            courseId,
            instructorId
        );

        sendResponse(res, 200, "Enrollment statistics retrieved", result);
    }),
};



export default 
    enrollmentController