import apiClient from "@/lib/api/axios";
import {
    EnrollmentStatusResponse,
    EnrollInCourseResponse,
    CreateOrderResponse,
    VerifyPaymentResponse,
    MyEnrolledCoursesResponse,
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

// ==================== ENROLLMENT API ====================

export const enrollmentApi = {
    // ============================
    // 📚 ENROLLMENT
    // ============================

    /**
     * Enroll in a free course
     */
    enrollInCourse: async (courseId: string): Promise<ApiResponse<EnrollInCourseResponse>> => {
        const response = await apiClient.post(`/enroll/${courseId}`);
        return response.data;
    },

    /**
     * Check enrollment status for a course
     */
    checkEnrollmentStatus: async (courseId: string): Promise<ApiResponse<EnrollmentStatusResponse>> => {
        const response = await apiClient.get(`/enroll/${courseId}/status`);
        return response.data;
    },

    /**
     * Get all enrolled courses for current user
     */
    getMyEnrolledCourses: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<ApiResponse<MyEnrolledCoursesResponse>> => {
        const response = await apiClient.get("/my-courses", { params });
        return response.data;
    },

    // ============================
    // 💳 PAYMENT (RAZORPAY)
    // ============================

    /**
     * Create Razorpay order for course enrollment
     */
    createOrder: async (data: CreateOrderDTO): Promise<ApiResponse<CreateOrderResponse>> => {
        const response = await apiClient.post("/payment/razorpay/order", data);
        return response.data;
    },

    /**
     * Verify Razorpay payment and activate enrollment
     */
    verifyPayment: async (data: VerifyPaymentDTO): Promise<ApiResponse<VerifyPaymentResponse>> => {
        const response = await apiClient.post("/payment/razorpay/verify", data);
        return response.data;
    },

    /**
     * Handle payment failure
     */
    handlePaymentFailure: async (data: PaymentFailureDTO): Promise<ApiResponse<{ message: string }>> => {
        const response = await apiClient.post("/payment/razorpay/failed", data);
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

export default enrollmentApi;
