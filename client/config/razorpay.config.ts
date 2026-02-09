import type { RazorpayOptions } from "@/services/payment/types";

// ==================== RAZORPAY CONFIGURATION ====================

/**
 * Razorpay Brand Configuration
 * Professional SaaS-level payment experience
 */
export const RAZORPAY_CONFIG = {
    // Brand Identity
    brand: {
        name: "EduApp",
        description: "Premium Learning Platform",
        logo: "/logo.png", // Update with your logo path
        icon: "/icon.png", // Update with your icon path
    },

    // Visual Theme
    theme: {
        // Primary brand color - Elegant indigo
        color: "#6366f1",

        // Gradient backdrop (optional, for premium feel)
        backdrop_color: "#f8fafc",

        // Hide Razorpay branding for premium experience (requires activation)
        hide_topbar: false, // Set to true after Razorpay approval
    },

    // Modal Customization
    modal: {
        // Modal behavior
        backdropClose: false, // Prevent accidental closure
        escape: true, // Allow ESC key to close
        animation: true, // Smooth animations
        handleback: true, // Handle browser back button
        confirm_close: true, // Confirm before closing

        // Responsive design
        ondismiss: () => {
            console.log("Payment modal dismissed");
        },
    },

    // Retry Configuration
    retry: {
        enabled: true,
        max_count: 3, // Allow up to 3 retry attempts
    },

    // Checkout Customization
    checkout: {
        // Show/hide elements for cleaner UI
        readonly: {
            email: false,
            contact: false,
            name: false,
        },

        // Hidden elements (if needed)
        hidden: {
            email: false,
            contact: false,
        },
    },

    // Notifications
    notify: {
        sms: true,
        email: true,
    },

    // Remember customer (for faster checkout)
    remember_customer: true,

    // Additional Security
    send_sms_hash: true,

    // Allow customer to save card details (requires PCI compliance)
    allow_rotation: true,
} as const;

/**
 * Payment Success Messages
 */
export const PAYMENT_MESSAGES = {
    success: {
        title: "🎉 Payment Successful!",
        description: "Welcome to the course. You can start learning immediately.",
        redirect: "Redirecting to course...",
    },

    failed: {
        title: "❌ Payment Failed",
        description: "Your payment could not be processed. Please try again.",
        retry: "Retry Payment",
    },

    cancelled: {
        title: "⚠️ Payment Cancelled",
        description: "You cancelled the payment. You can try again anytime.",
        action: "Try Again",
    },

    processing: {
        title: "⏳ Processing Payment",
        description: "Please wait while we verify your payment...",
    },
} as const;

/**
 * Build Razorpay options with config
 */
export const buildRazorpayOptions = (params: {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    courseTitle: string;
    user?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    onSuccess: (response: any) => void;
    onFailure: (error: any) => void;
    onDismiss?: () => void;
}): RazorpayOptions => {
    const { orderId, amount, currency, keyId, courseTitle, user, onSuccess, onFailure, onDismiss } = params;

    return {
        key: keyId,
        amount,
        currency,
        name: RAZORPAY_CONFIG.brand.name,
        description: `${courseTitle} - ${RAZORPAY_CONFIG.brand.description}`,
        image: RAZORPAY_CONFIG.brand.logo,
        order_id: orderId,

        // Handler for successful payment
        handler: onSuccess,

        // Prefill customer information
        prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.contact || "",
        },

        // Notes for reference
        notes: {
            course_title: courseTitle,
            platform: "EduApp",
        },

        // Theme configuration
        theme: {
            color: RAZORPAY_CONFIG.theme.color,
        },

        // Modal configuration
        modal: {
            ondismiss: onDismiss || RAZORPAY_CONFIG.modal.ondismiss,
            escape: RAZORPAY_CONFIG.modal.escape,
            animation: RAZORPAY_CONFIG.modal.animation,
        },

        // Additional configurations
        retry: RAZORPAY_CONFIG.retry,
        remember_customer: RAZORPAY_CONFIG.remember_customer,
        send_sms_hash: RAZORPAY_CONFIG.send_sms_hash,
    } as RazorpayOptions;
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = "INR"): string => {
    const symbols: Record<string, string> = {
        INR: "₹",
        USD: "$",
        EUR: "€",
        GBP: "£",
    };

    const symbol = symbols[currency.toUpperCase()] || currency;
    const value = Math.round(amount / 100); // Convert from paisa to rupees

    return `${symbol}${value.toLocaleString("en-IN")}`;
};

/**
 * Get payment description for receipt
 */
export const getPaymentDescription = (courseTitle: string): string => {
    return `Course Enrollment: ${courseTitle}`;
};
