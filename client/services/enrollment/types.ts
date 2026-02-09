import { ICourse } from "../courses";

// ==================== ENUMS ====================

export enum EnrollmentStatus {
    PENDING = "pending",
    ACTIVE = "active",
    EXPIRED = "expired",
    CANCELLED = "cancelled",
    FAILED = "failed",
}

// ==================== INTERFACES ====================

export interface IEnrollment {
    _id: string;
    userId: string;
    courseId: string | ICourse;
    orderId?: string;
    paymentId?: string;
    amount: number;
    currency: string;
    status: EnrollmentStatus;
    enrolledAt?: string;
    expiresAt?: string;
    progress?: number;
    createdAt: string;
    updatedAt: string;
}

// ==================== RESPONSE INTERFACES ====================

export interface EnrollmentStatusResponse {
    isEnrolled: boolean;
    enrollment: IEnrollment | null;
}

export interface EnrollInCourseResponse {
    enrollment: IEnrollment;
    message: string;
    requiresPayment: boolean;
}

export interface MyEnrolledCoursesResponse {
    enrollments: IEnrollment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
