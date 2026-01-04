import { Router } from "express";
import { enrollmentController, paymentController } from "src/controllers/enrollment.controller.js";
import { validateRequest } from "src/middlewares/custom/validateRequest.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import { z } from "zod";

const router = Router();

// ============================================
// VALIDATION SCHEMAS
// ============================================
const createOrderSchema = z.object({
    courseId: z.string().min(1, "Course ID is required"),
});

const verifyPaymentSchema = z.object({
    razorpayOrderId: z.string().min(1, "Razorpay Order ID is required"),
    razorpayPaymentId: z.string().min(1, "Razorpay Payment ID is required"),
    razorpaySignature: z.string().min(1, "Razorpay Signature is required"),
});

const paymentFailureSchema = z.object({
    razorpayOrderId: z.string().min(1, "Razorpay Order ID is required"),
    reason: z.string().optional(),
});

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

// ============================================
// 💳 PAYMENT ROUTES (RAZORPAY)
// ============================================

/**
 * @route   POST /api/payment/razorpay/order
 * @desc    Create a Razorpay order for course enrollment
 * @access  Private (Authenticated users)
 * @body    { courseId: string }
 */
router.post(
    "/payment/razorpay/order",
    validateRequest(createOrderSchema),
    paymentController.createOrder
);

/**
 * @route   POST /api/payment/razorpay/verify
 * @desc    Verify Razorpay payment and activate enrollment
 * @access  Private (Authenticated users)
 * @body    { razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string }
 */
router.post(
    "/payment/razorpay/verify",
    validateRequest(verifyPaymentSchema),
    paymentController.verifyPayment
);

/**
 * @route   POST /api/payment/razorpay/failed
 * @desc    Handle payment failure
 * @access  Private (Authenticated users)
 * @body    { razorpayOrderId: string, reason?: string }
 */
router.post(
    "/payment/razorpay/failed",
    validateRequest(paymentFailureSchema),
    paymentController.handlePaymentFailure
);

/**
 * @route   GET /api/payments
 * @desc    Get user's payment history
 * @access  Private (Authenticated users)
 */
router.get("/payments", paymentController.getMyPayments);

/**
 * @route   GET /api/payments/:paymentId
 * @desc    Get specific payment details
 * @access  Private (Authenticated users)
 */
router.get("/payments/:paymentId", paymentController.getPaymentDetails);

export default router;
