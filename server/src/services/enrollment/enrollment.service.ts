import { Types } from "mongoose";
import sessionService from "src/cache/userCache.js";
import { classroomService } from "../classroom/classroom.service.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import Enrollment, { EnrollmentStatus } from "src/models/enrollment.model.js";
import { PaymentStatus } from "src/models/payment.model.js";
import { courseRepository } from "src/repositories/course.repository.js";
import { enrollmentRepository } from "src/repositories/enrollment.repository.js";
import { paymentRepository } from "src/repositories/payment.repository.js";
import { courseCouponService } from "src/services/course/courseCoupon.service.js";
import { addEmailJob } from "src/bull/workers/email.worker.js";
import emailQueue from "src/bull/queues/email.queue.js";
import { EMAIL_JOB_NAMES } from "src/constants/email-jobs.constants.js";
import { authRepository } from "src/repositories/auth.repository.js";
import AppError from "src/utils/AppError.js";
import logger from "src/utils/logger.js";
import razorpayUtils from "src/utils/razorpay.js";

// ============================================
// INTERFACES
// ============================================
interface EnrollCourseData {
    courseId: string;
    userId: string;
}

interface CreateOrderData {
    courseId: string;
    userId: string;
    couponCode?: string;
}

interface VerifyPaymentData {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    userId: string;
}

// ============================================
// ENROLLMENT SERVICE
// ============================================
export const enrollmentService = {
    /**
     * Enroll user in a free course directly
     * For paid courses, this creates a pending enrollment
     */
    enrollInCourse: async (data: EnrollCourseData) => {
        const { courseId, userId } = data;

        // Check if course exists
        const course = await courseRepository.findById(courseId);
        if (!course) {
            throw new AppError(
                "Course not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        // Check if course is published
        if (!course.isPublished) {
            throw new AppError(
                "Course is not available for enrollment",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.BAD_REQUEST
            );
        }

        // Check for existing enrollment
        const existingEnrollment = await enrollmentRepository.findByUserAndCourse(
            userId,
            courseId
        );

        if (existingEnrollment) {
            if (existingEnrollment.status === EnrollmentStatus.ACTIVE) {
                throw new AppError(
                    "You are already enrolled in this course",
                    STATUSCODE.CONFLICT,
                    ERROR_CODE.DUPLICATE_RESOURCE
                );
            }
            // If pending or failed, allow re-enrollment
            if (existingEnrollment.status === EnrollmentStatus.PENDING) {
                return {
                    enrollment: existingEnrollment,
                    message: "Enrollment pending. Please complete payment.",
                    requiresPayment: !course.pricing.isFree,
                };
            }
        }

        // Check if course is free
        const isFree = course.pricing.isFree || (course.pricing.price === 0);

        if (isFree) {
            // Direct enrollment for free courses
            const enrollment = await enrollmentRepository.create({
                userId: new Types.ObjectId(userId),
                courseId: new Types.ObjectId(courseId),
                amount: 0,
                currency: "INR",
                status: EnrollmentStatus.ACTIVE,
                enrolledAt: new Date(),
            });

            // Increment course enrollment count
            await courseRepository.updateById(courseId, null, {
                $inc: { totalEnrollments: 1 },
            });

            logger.info("Free course enrollment successful", {
                userId,
                courseId,
                enrollmentId: enrollment._id,
            });

            // Invalidate classroom cache
            await classroomService.invalidateClassroomCache(userId);

            return {
                enrollment,
                message: "Successfully enrolled in the course",
                requiresPayment: false,
            };
        }

        // For paid courses, create a pending enrollment and return payment info
        throw new AppError(
            "This is a paid course. Please initiate payment first.",
            STATUSCODE.BAD_REQUEST,
            ERROR_CODE.BAD_REQUEST
        );
    },

    /**
     * Check if user is enrolled in a course
     */
    checkEnrollment: async (userId: string, courseId: string) => {
        const isEnrolled = await enrollmentRepository.isEnrolled(userId, courseId);
        const enrollment = isEnrolled
            ? await enrollmentRepository.findActiveEnrollment(userId, courseId)
            : null;

        return {
            isEnrolled,
            enrollment,
        };
    },

    /**
     * Get user's enrolled courses
     */
    getMyEnrolledCourses: async (
        userId: string,
        query: { page?: number; limit?: number; status?: EnrollmentStatus }
    ) => {
        return enrollmentRepository.findByUser(userId, {
            ...query,
            status: query.status || EnrollmentStatus.ACTIVE,
        });
    },

    /**
     * Get course enrollments (for instructor)
     */
    getCourseEnrollments: async (
        courseId: string,
        instructorId: string,
        query: { page?: number; limit?: number; status?: EnrollmentStatus }
    ) => {
        // Verify instructor owns the course
        const isOwner = await courseRepository.isOwner(courseId, instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to view enrollments for this course",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        return enrollmentRepository.findByCourse(courseId, query);
    },

    /**
     * Get enrollment statistics
     */
    getEnrollmentStats: async (courseId: string, instructorId: string) => {
        // Verify instructor owns the course
        const isOwner = await courseRepository.isOwner(courseId, instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to view stats for this course",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        const [activeCount, totalPayments] = await Promise.all([
            enrollmentRepository.countByCourse(courseId),
            paymentRepository.getStats({ courseId: new Types.ObjectId(courseId) }),
        ]);

        return {
            activeEnrollments: activeCount,
            totalRevenue: totalPayments.totalAmount,
            totalPaidEnrollments: totalPayments.count,
        };
    },

    getEnrolmentCoursesIds: async (userId: string) => {
        const courseIds = await Enrollment.find({ userId }).distinct("courseId").exec();
        return courseIds;
    },

};

