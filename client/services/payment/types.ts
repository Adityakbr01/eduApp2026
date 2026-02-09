// ==================== ENUMS ====================

export enum PaymentStatus {
    CREATED = "created",
    AUTHORIZED = "authorized",
    CAPTURED = "captured",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded",
}

// ==================== INTERFACES ====================

export interface IPayment {
    _id: string;
    userId: string;
    courseId: string;
    enrollmentId?: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    receipt: string;
    failureReason?: string;
    paidAt?: string;
    createdAt: string;
    updatedAt: string;
}

// ==================== RESPONSE INTERFACES ====================

export interface CreateOrderResponse {
    orderId: string;
    amount: number; // In paisa
    currency: string;
    keyId: string;
    courseTitle: string;
    paymentId: string;
}

export interface VerifyPaymentResponse {
    message: string;
    enrollment: any; // Import from enrollment types if needed
    payment: IPayment;
}

export interface PaymentHistoryResponse {
    payments: IPayment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ==================== DTO INTERFACES ====================

export interface CreateOrderDTO {
    courseId: string;
}

export interface VerifyPaymentDTO {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export interface PaymentFailureDTO {
    razorpayOrderId: string;
    reason?: string;
}

// ==================== RAZORPAY TYPES ====================

export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
        escape?: boolean;
        animation?: boolean;
    };
}

export interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface RazorpayError {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
        order_id: string;
        payment_id: string;
    };
}

// Razorpay window type
declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => {
            open: () => void;
            close: () => void;
            on: (event: string, callback: (response: RazorpayError) => void) => void;
        };
    }
}
