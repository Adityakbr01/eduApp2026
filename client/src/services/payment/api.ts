import apiClient from "@/lib/api/axios";
import {
    CreateOrderResponse,
    VerifyPaymentResponse,
    PaymentHistoryResponse,
    CreateOrderDTO,
    VerifyPaymentDTO,
    PaymentFailureDTO,
    IPayment,
} from "./types";

// ==================== API RESPONSE TYPE ====================

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// ==================== PAYMENT API ====================

export const paymentApi = {
    // ============================
    // 💳 PAYMENT (RAZORPAY)
    // ============================

    /**
     * Create Razorpay order for course enrollment
     */
    createOrder: async (data: CreateOrderDTO): Promise<ApiResponse<CreateOrderResponse>> => {
        const response = await apiClient.post("/payments/razorpay/order", data);
        return response.data;
    },

    /**
     * Verify Razorpay payment and activate enrollment
     */
    verifyPayment: async (data: VerifyPaymentDTO): Promise<ApiResponse<VerifyPaymentResponse>> => {
        const response = await apiClient.post("/payments/razorpay/verify", data);
        return response.data;
    },

    /**
     * Handle payment failure
     */
    handlePaymentFailure: async (data: PaymentFailureDTO): Promise<ApiResponse<{ message: string }>> => {
        const response = await apiClient.post("/payments/razorpay/failed", data);
        return response.data;
    },

    /**
     * Get user's payment history
     */
    getMyPayments: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<ApiResponse<PaymentHistoryResponse>> => {
        const response = await apiClient.get("/payments", { params });
        return response.data;
    },

    /**
     * Get specific payment details
     */
    getPaymentDetails: async (paymentId: string): Promise<ApiResponse<IPayment>> => {
        const response = await apiClient.get(`/payments/${paymentId}`);
        return response.data;
    },
};

export default paymentApi;
