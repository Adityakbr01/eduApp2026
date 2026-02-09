import { Types } from "mongoose";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import Enrollment, { EnrollmentStatus } from "src/models/enrollment.model.js";
import { PaymentStatus } from "src/models/payment.model.js";
import { enrollmentRepository } from "src/repositories/enrollment.repository.js";
import { paymentRepository } from "src/repositories/payment.repository.js";
import { courseRepository } from "src/repositories/course.repository.js";
import AppError from "src/utils/AppError.js";
import razorpayUtils from "src/utils/razorpay.js";
import logger from "src/utils/logger.js";
import sessionService from "src/cache/userCache.js";

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
            await courseRepository.updateById(courseId, {
                $inc: { totalEnrollments: 1 },
            });

            logger.info("Free course enrollment successful", {
                userId,
                courseId,
                enrollmentId: enrollment._id,
            });

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

// ============================================
// PAYMENT SERVICE
// ============================================
export const paymentService = {
    /**
     * Create Razorpay order for course enrollment
     */
    createOrder: async (data: CreateOrderData) => {
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

        // Check if already enrolled
        const isEnrolled = await enrollmentRepository.isEnrolled(userId, courseId);
        if (isEnrolled) {
            throw new AppError(
                "You are already enrolled in this course",
                STATUSCODE.CONFLICT,
                ERROR_CODE.DUPLICATE_RESOURCE
            );
        }

        // Check if course is free
        const isFree = course.pricing.isFree || (course.pricing.price === 0);
        if (isFree) {
            throw new AppError(
                "This is a free course. Use the enroll endpoint directly.",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.BAD_REQUEST
            );
        }

        // Check for existing pending payment
        const existingEnrollment = await enrollmentRepository.findByUserAndCourse(
            userId,
            courseId
        );

        if (existingEnrollment && existingEnrollment.status === EnrollmentStatus.PENDING) {
            // Check if order is still valid
            const existingPayment = await paymentRepository.findByOrderId(
                existingEnrollment.orderId!
            );
            if (existingPayment && existingPayment.status === PaymentStatus.CREATED) {
                // Return existing order
                return {
                    orderId: existingEnrollment.orderId,
                    amount: existingPayment.amount,
                    currency: existingPayment.currency,
                    keyId: razorpayUtils.getKeyId(),
                    courseTitle: course.title,
                };
            }
        }

        // Create Razorpay order
        const amount = course.pricing.price || 0;
        const currency = course.pricing.currency || "INR";
        const receipt = razorpayUtils.generateReceiptId("course");

        const razorpayOrder = await razorpayUtils.createOrder({
            amount,
            currency,
            receipt,
            notes: {
                courseId,
                userId,
                courseTitle: course.title,
            },
        });

        // Create payment record
        const payment = await paymentRepository.create({
            userId: new Types.ObjectId(userId),
            courseId: new Types.ObjectId(courseId),
            razorpayOrderId: razorpayOrder.id,
            amount,
            currency,
            status: PaymentStatus.CREATED,
            receipt,
            notes: {
                courseId,
                userId,
                courseTitle: course.title,
            },
        });

        // Create or update pending enrollment
        if (existingEnrollment) {
            await enrollmentRepository.updateById(existingEnrollment._id, {
                orderId: razorpayOrder.id,
                amount,
                currency,
                status: EnrollmentStatus.PENDING,
            });
        } else {
            await enrollmentRepository.create({
                userId: new Types.ObjectId(userId),
                courseId: new Types.ObjectId(courseId),
                orderId: razorpayOrder.id,
                amount,
                currency,
                status: EnrollmentStatus.PENDING,
            });
        }

        logger.info("Razorpay order created for course enrollment", {
            userId,
            courseId,
            orderId: razorpayOrder.id,
            amount,
        });

        return {
            orderId: razorpayOrder.id,
            amount: razorpayUtils.toPaisa(amount), // Frontend expects paisa
            currency,
            keyId: razorpayUtils.getKeyId(),
            courseTitle: course.title,
            paymentId: payment._id,
        };
    },

    /**
     * Verify Razorpay payment and activate enrollment
     */
    verifyPayment: async (data: VerifyPaymentData) => {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, userId } = data;

        // Verify signature FIRST - this is critical for security
        const isValidSignature = razorpayUtils.verifyPaymentSignature({
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        });

        if (!isValidSignature) {
            logger.warn("Invalid payment signature detected", {
                razorpayOrderId,
                razorpayPaymentId,
                userId,
            });

            // Mark payment and enrollment as failed
            await Promise.all([
                paymentRepository.markAsFailed(razorpayOrderId, "Invalid signature"),
                enrollmentRepository.failEnrollment(razorpayOrderId),
            ]);

            throw new AppError(
                "Payment verification failed. Invalid signature.",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.BAD_REQUEST
            );
        }

        // Find the payment record
        const payment = await paymentRepository.findByOrderId(razorpayOrderId);
        if (!payment) {
            throw new AppError(
                "Payment record not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        // Verify user matches
        if (payment.userId.toString() !== userId) {
            throw new AppError(
                "Payment does not belong to this user",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        // Check if already processed
        if (payment.status === PaymentStatus.PAID) {
            const enrollment = await enrollmentRepository.findActiveEnrollment(
                userId,
                payment.courseId.toString()
            );
            return {
                message: "Payment already verified",
                enrollment,
                payment,
            };
        }

        // Find and activate enrollment
        const enrollment = await enrollmentRepository.activateEnrollment(
            razorpayOrderId,
            razorpayPaymentId
        );

        if (!enrollment) {
            throw new AppError(
                "Enrollment record not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        // Update payment record
        const updatedPayment = await paymentRepository.markAsPaid(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            enrollment._id as Types.ObjectId
        );

        // Increment course enrollment count
        await Promise.all([
            courseRepository.updateById(payment.courseId.toString(), {
                $inc: { totalEnrollments: 1 },
            }),

            sessionService.addCourseToUserCache(userId, {
                courseId: payment.courseId.toString(),
                enrollmentId: enrollment._id.toString(),
                purchasedAt: Date.now(),
            }),
        ]);




        logger.info("Payment verified and enrollment activated", {
            userId,
            courseId: payment.courseId,
            enrollmentId: enrollment._id,
            paymentId: razorpayPaymentId,
        });

        return {
            message: "Payment verified successfully. Enrollment activated.",
            enrollment,
            payment: updatedPayment,
        };
    },

    /**
     * Handle payment failure
     */
    handlePaymentFailure: async (razorpayOrderId: string, reason?: string) => {
        await Promise.all([
            paymentRepository.markAsFailed(razorpayOrderId, reason),
            enrollmentRepository.failEnrollment(razorpayOrderId),
        ]);

        logger.info("Payment failure recorded", { razorpayOrderId, reason });

        return { message: "Payment failure recorded" };
    },

    /**
     * Get user's payment history
     */
    getMyPayments: async (
        userId: string,
        query: { page?: number; limit?: number; status?: PaymentStatus }
    ) => {
        return paymentRepository.findByUser(userId, query);
    },

    /**
     * Get payment details
     */
    getPaymentDetails: async (paymentId: string, userId: string) => {
        const payment = await paymentRepository.findByIdWithDetails(paymentId);

        if (!payment) {
            throw new AppError(
                "Payment not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        if (payment.userId.toString() !== userId) {
            throw new AppError(
                "You don't have permission to view this payment",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        return payment;
    },
};
