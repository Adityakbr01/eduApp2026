import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollmentApi } from "./api";
import { VerifyPaymentDTO, PaymentFailureDTO, RazorpayOptions, RazorpayResponse } from "./types";
import { mutationHandlers } from "@/services/common/mutation-utils";
import { QUERY_KEYS } from "@/config/query-keys";

// ==================== ENROLLMENT MUTATIONS ====================

/**
 * Enroll in a free course
 */
export const useEnrollInFreeCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (courseId: string) => enrollmentApi.enrollInCourse(courseId),
        onSuccess: (response, courseId) => {
            mutationHandlers.success(response.message || "Successfully enrolled in the course!");
            // Invalidate enrollment status and my courses
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.ENROLLMENT.STATUS(courseId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.ENROLLMENT.MY_COURSES,
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Create Razorpay order for paid course
 */
export const useCreatePaymentOrder = () => {
    return useMutation({
        mutationFn: (courseId: string) => enrollmentApi.createOrder({ courseId }),
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Verify Razorpay payment
 */
export const useVerifyPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: VerifyPaymentDTO) => enrollmentApi.verifyPayment(data),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Payment successful! You are now enrolled.");
            // Invalidate all enrollment queries
            queryClient.invalidateQueries({
                queryKey: ["enrollment"],
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.PAYMENTS.HISTORY,
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Handle payment failure
 */
export const useHandlePaymentFailure = () => {
    return useMutation({
        mutationFn: (data: PaymentFailureDTO) => enrollmentApi.handlePaymentFailure(data),
        onError: (error) => console.error("Failed to record payment failure:", error),
    });
};

// ==================== RAZORPAY HOOK ====================

interface UseRazorpayOptions {
    onSuccess?: (response: RazorpayResponse) => void;
    onError?: (error: Error) => void;
    onDismiss?: () => void;
}

/**
 * Load Razorpay script dynamically
 */
const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (typeof window !== "undefined" && window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

/**
 * Custom hook for Razorpay payment
 */
export const useRazorpayPayment = (options?: UseRazorpayOptions) => {
    const createOrder = useCreatePaymentOrder();
    const verifyPayment = useVerifyPayment();
    const handleFailure = useHandlePaymentFailure();

    const initiatePayment = async (
        courseId: string,
        userInfo?: { name?: string; email?: string; contact?: string }
    ) => {
        try {
            // Load Razorpay script
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                throw new Error("Failed to load Razorpay. Please check your internet connection.");
            }

            // Create order
            const orderResponse = await createOrder.mutateAsync(courseId);
            const orderData = orderResponse.data;

            // Configure Razorpay options
            const razorpayOptions: RazorpayOptions = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "EduApp",
                description: `Enrollment: ${orderData.courseTitle}`,
                order_id: orderData.orderId,
                handler: async (response: RazorpayResponse) => {
                    try {
                        // Verify payment on backend
                        await verifyPayment.mutateAsync({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        options?.onSuccess?.(response);
                    } catch (error) {
                        options?.onError?.(error as Error);
                    }
                },
                prefill: {
                    name: userInfo?.name || "",
                    email: userInfo?.email || "",
                    contact: userInfo?.contact || "",
                },
                notes: {
                    courseId,
                },
                theme: {
                    color: "#6366f1", // Primary color
                },
                modal: {
                    ondismiss: () => {
                        options?.onDismiss?.();
                    },
                    escape: true,
                    animation: true,
                },
            };

            // Open Razorpay checkout
            const razorpay = new window.Razorpay(razorpayOptions);

            razorpay.on("payment.failed", (response) => {
                handleFailure.mutate({
                    razorpayOrderId: response.metadata.order_id,
                    reason: response.description,
                });
                options?.onError?.(new Error(response.description || "Payment failed"));
            });

            razorpay.open();
        } catch (error) {
            options?.onError?.(error as Error);
            throw error;
        }
    };

    return {
        initiatePayment,
        isCreatingOrder: createOrder.isPending,
        isVerifying: verifyPayment.isPending,
        isLoading: createOrder.isPending || verifyPayment.isPending,
    };
};
