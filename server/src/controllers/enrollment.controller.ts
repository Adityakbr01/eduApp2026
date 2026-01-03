import { enrollmentService, paymentService } from "src/services/enrollment.service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";
import { EnrollmentStatus } from "src/models/enrollment.model.js";
import { PaymentStatus } from "src/models/payment.model.js";

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

// ============================================
// PAYMENT CONTROLLER
// ============================================
export const paymentController = {
    /**
     * Create Razorpay order
     * POST /api/payment/razorpay/order
     */
    createOrder: catchAsync(async (req, res) => {
        const userId = req.user!.id;
        const { courseId } = req.body;

        const result = await paymentService.createOrder({
            courseId,
            userId,
        });

        sendResponse(res, 201, "Order created successfully", result);
    }),

    /**
     * Verify Razorpay payment
     * POST /api/payment/razorpay/verify
     */
    verifyPayment: catchAsync(async (req, res) => {
        const userId = req.user!.id;
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        const result = await paymentService.verifyPayment({
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            userId,
        });

        sendResponse(res, 200, result.message, {
            enrollment: result.enrollment,
            payment: result.payment,
        });
    }),

    /**
     * Handle payment failure (webhook or frontend callback)
     * POST /api/payment/razorpay/failed
     */
    handlePaymentFailure: catchAsync(async (req, res) => {
        const { razorpayOrderId, reason } = req.body;

        const result = await paymentService.handlePaymentFailure(
            razorpayOrderId,
            reason
        );

        sendResponse(res, 200, result.message);
    }),

    /**
     * Get my payment history
     * GET /api/payments
     */
    getMyPayments: catchAsync(async (req, res) => {
        const userId = req.user!.id;
        const { page, limit, status } = req.query as {
            page?: string;
            limit?: string;
            status?: PaymentStatus;
        };

        const result = await paymentService.getMyPayments(userId, {
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            status,
        });

        sendResponse(res, 200, "Payment history retrieved", result);
    }),

    /**
     * Get payment details
     * GET /api/payments/:paymentId
     */
    getPaymentDetails: catchAsync<{ paymentId: string }>(async (req, res) => {
        const userId = req.user!.id;
        const { paymentId } = req.params;

        const result = await paymentService.getPaymentDetails(paymentId, userId);

        sendResponse(res, 200, "Payment details retrieved", result);
    }),
};

export default {
    enrollmentController,
    paymentController,
};
