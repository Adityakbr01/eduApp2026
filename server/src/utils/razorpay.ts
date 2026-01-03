import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "src/configs/env.js";
import logger from "src/utils/logger.js";

// ============================================
// RAZORPAY INSTANCE
// ============================================
const razorpayInstance = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
});

// ============================================
// INTERFACES
// ============================================
export interface CreateOrderOptions {
    amount: number; // Amount in paisa (₹100 = 10000)
    currency?: string;
    receipt?: string;
    notes?: Record<string, string>;
}

export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: Record<string, string>;
    created_at: number;
}

export interface VerifyPaymentOptions {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export interface PaymentDetails {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    status: string;
    order_id: string;
    method: string;
    email: string;
    contact: string;
    created_at: number;
}

// ============================================
// RAZORPAY UTILITY FUNCTIONS
// ============================================
export const razorpayUtils = {
    /**
     * Create a new Razorpay order
     * @param options - Order creation options
     * @returns Created order details
     */
    createOrder: async (options: CreateOrderOptions): Promise<RazorpayOrder> => {
        const { amount, currency = "INR", receipt, notes = {} } = options;

        // Razorpay expects amount in paisa (smallest currency unit)
        // If amount is in rupees, convert to paisa
        const amountInPaisa = Math.round(amount * 100);

        const orderOptions = {
            amount: amountInPaisa,
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            notes,
        };

        try {
            const order = await razorpayInstance.orders.create(orderOptions);
            logger.info("Razorpay order created", {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
            });
            return order as RazorpayOrder;
        } catch (error) {
            logger.error("Failed to create Razorpay order", { error, options });
            throw error;
        }
    },

    /**
     * Verify Razorpay payment signature
     * This is crucial for security - never trust frontend payment data
     * @param options - Payment verification options
     * @returns boolean indicating if signature is valid
     */
    verifyPaymentSignature: (options: VerifyPaymentOptions): boolean => {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = options;

        // Create the expected signature using HMAC SHA256
        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        // Compare signatures securely
        const isValid = crypto.timingSafeEqual(
            Buffer.from(expectedSignature),
            Buffer.from(razorpaySignature)
        );

        logger.info("Payment signature verification", {
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
            isValid,
        });

        return isValid;
    },

    /**
     * Fetch payment details from Razorpay
     * @param paymentId - Razorpay payment ID
     * @returns Payment details
     */
    fetchPayment: async (paymentId: string): Promise<PaymentDetails> => {
        try {
            const payment = await razorpayInstance.payments.fetch(paymentId);
            return payment as PaymentDetails;
        } catch (error) {
            logger.error("Failed to fetch payment details", { paymentId, error });
            throw error;
        }
    },

    /**
     * Fetch order details from Razorpay
     * @param orderId - Razorpay order ID
     * @returns Order details
     */
    fetchOrder: async (orderId: string): Promise<RazorpayOrder> => {
        try {
            const order = await razorpayInstance.orders.fetch(orderId);
            return order as RazorpayOrder;
        } catch (error) {
            logger.error("Failed to fetch order details", { orderId, error });
            throw error;
        }
    },

    /**
     * Initiate a refund for a payment
     * @param paymentId - Razorpay payment ID
     * @param amount - Amount to refund in paisa (optional, full refund if not provided)
     * @returns Refund details
     */
    refundPayment: async (paymentId: string, amount?: number) => {
        try {
            const refundOptions: any = {};
            if (amount) {
                refundOptions.amount = Math.round(amount * 100); // Convert to paisa
            }

            const refund = await razorpayInstance.payments.refund(paymentId, refundOptions);
            logger.info("Payment refund initiated", { paymentId, refund });
            return refund;
        } catch (error) {
            logger.error("Failed to initiate refund", { paymentId, amount, error });
            throw error;
        }
    },

    /**
     * Get the Razorpay key ID (for frontend)
     * NEVER expose the key secret
     */
    getKeyId: (): string => {
        return env.RAZORPAY_KEY_ID;
    },

    /**
     * Convert amount to paisa
     * @param amount - Amount in rupees
     * @returns Amount in paisa
     */
    toPaisa: (amount: number): number => {
        return Math.round(amount * 100);
    },

    /**
     * Convert paisa to amount
     * @param paisa - Amount in paisa
     * @returns Amount in rupees
     */
    fromPaisa: (paisa: number): number => {
        return paisa / 100;
    },

    /**
     * Generate a unique receipt ID
     * @param prefix - Optional prefix for the receipt
     * @returns Unique receipt ID
     */
    generateReceiptId: (prefix: string = "rcpt"): string => {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    },
};

export default razorpayUtils;
