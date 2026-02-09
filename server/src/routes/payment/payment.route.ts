import { Router } from "express";
import { paymentController } from "src/controllers/payment/paymentController.js";
import { validateRequest } from "src/middlewares/custom/validateRequest.js";
import z from "zod";

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
// 💳 PAYMENT ROUTES (RAZORPAY)
// ============================================

/**
 * @route   POST /api/payment/razorpay/order
 * @desc    Create a Razorpay order for course enrollment
 * @access  Private (Authenticated users)
 * @body    { courseId: string }
 */
router.post(
    "/razorpay/order",
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
    "/razorpay/verify",
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
    "/razorpay/failed",
    validateRequest(paymentFailureSchema),
    paymentController.handlePaymentFailure
);

/**
 * @route   GET /api/payments
 * @desc    Get user's payment history
 * @access  Private (Authenticated users)
 */
router.get("/", paymentController.getMyPayments);

/**
 * @route   GET /api/payments/:paymentId
 * @desc    Get specific payment details
 * @access  Private (Authenticated users)
 */
router.get("/:paymentId", paymentController.getPaymentDetails);


export default router;