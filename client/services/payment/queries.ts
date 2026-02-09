import { useQuery } from "@tanstack/react-query";
import { paymentApi } from "./api";
import { QUERY_KEYS } from "@/config/query-keys";

// ==================== PAYMENT QUERIES ====================

/**
 * Get user's payment history
 */
export const usePaymentHistory = (params?: {
    page?: number;
    limit?: number;
    status?: string;
}) => {
    return useQuery({
        queryKey: QUERY_KEYS.PAYMENTS.HISTORY,
        queryFn: () => paymentApi.getMyPayments(params),
    });
};

/**
 * Get specific payment details
 */
export const usePaymentDetails = (paymentId: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.PAYMENTS.DETAIL(paymentId),
        queryFn: () => paymentApi.getPaymentDetails(paymentId),
        enabled: !!paymentId,
    });
};
