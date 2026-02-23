import { PaymentStatus } from "src/models/payment.model.js";
import { paymentService } from "src/services/payments/payment.service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";


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
        const { courseId, couponCode } = req.body;

        const result = await paymentService.createOrder({
            courseId,
            userId,
            couponCode,
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