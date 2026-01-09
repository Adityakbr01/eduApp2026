import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query-keys";
import { enrollmentApi } from "./api";
import { EnrollmentStatus } from "./types";

// ==================== ENROLLMENT QUERIES ====================

/**
 * Get user's enrolled courses
 */
export const useGetMyEnrolledCourses = (params?: {
    page?: number;
    limit?: number;
    status?: EnrollmentStatus;
}) => {
    return useQuery({
        queryKey: params?.page
            ? QUERY_KEYS.ENROLLMENT.MY_COURSES_PAGINATED(params.page)
            : QUERY_KEYS.ENROLLMENT.MY_COURSES,
        queryFn: () => enrollmentApi.getMyEnrolledCourses(params),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

// ==================== PAYMENT QUERIES ====================

/**
 * Get user's payment history
 */
export const useGetMyPayments = (params?: {
    page?: number;
    limit?: number;
    status?: string;
}) => {
    return useQuery({
        queryKey: params?.page
            ? QUERY_KEYS.PAYMENTS.HISTORY_PAGINATED(params.page)
            : QUERY_KEYS.PAYMENTS.HISTORY,
        queryFn: () => enrollmentApi.getMyPayments(params),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

/**
 * Get specific payment details
 */
export const useGetPaymentDetails = (paymentId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: QUERY_KEYS.PAYMENTS.DETAIL(paymentId),
        queryFn: () => enrollmentApi.getPaymentDetails(paymentId),
        enabled: enabled && !!paymentId,
    });
};
