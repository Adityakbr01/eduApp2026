import mongoose, { Types } from "mongoose";
import emailQueue from "src/bull/queues/email.queue.js";
import { addEmailJob } from "src/bull/workers/email.worker.js";
import sessionService from "src/cache/userCache.js";
import { EMAIL_JOB_NAMES } from "src/constants/email-jobs.constants.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { EnrollmentStatus } from "src/models/enrollment.model.js";
import { PaymentStatus } from "src/models/payment.model.js";
import { authRepository } from "src/repositories/auth.repository.js";
import { courseRepository } from "src/repositories/course.repository.js";
import { courseCouponRepository } from "src/repositories/courseCoupon.repository.js";
import { enrollmentRepository } from "src/repositories/enrollment.repository.js";
import { paymentRepository } from "src/repositories/payment.repository.js";
import { classroomService } from "src/services/classroom/classroom.service.js";
import { courseCouponService } from "src/services/course/courseCoupon.service.js";
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
// PAYMENT SERVICE
// ============================================
export const paymentService = {
    /**
     * Create Razorpay order for course enrollment
     */
    createOrder: async (data: CreateOrderData) => {
        const { courseId, userId, couponCode } = data;

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
        let amount = course.pricing.price || 0;
        let couponId = null;
        let discountAmount = 0;

        if (couponCode) {
            const couponResult = await courseCouponService.validateCoupon(couponCode, courseId, userId);
            if (couponResult.isValid) {
                amount = couponResult.finalPrice;
                couponId = couponResult.couponId;
                discountAmount = couponResult.originalPrice - couponResult.finalPrice;
            }
        }

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
                couponCode: couponCode || "",
                discountAmount: discountAmount.toString(),
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
            couponId,
            discountAmount,
            notes: {
                courseId,
                userId,
                courseTitle: course.title,
                couponCode: couponCode || "",
            },
        });

        // Create or update pending enrollment
        if (existingEnrollment) {
            await enrollmentRepository.updateById(existingEnrollment._id, {
                orderId: razorpayOrder.id,
                amount,
                currency,
                status: EnrollmentStatus.PENDING,
                couponId,
                discountAmount,
            });
        } else {
            await enrollmentRepository.create({
                userId: new Types.ObjectId(userId),
                courseId: new Types.ObjectId(courseId),
                orderId: razorpayOrder.id,
                amount,
                currency,
                status: EnrollmentStatus.PENDING,
                couponId,
                discountAmount,
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

        logger.info("Payment verification started", {
            razorpayOrderId,
            userId,
        });

        // 1️⃣ Verify signature
        const isValidSignature = razorpayUtils.verifyPaymentSignature({
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        });

        if (!isValidSignature) {
            logger.warn("Invalid Razorpay signature", { razorpayOrderId });

            await Promise.allSettled([
                paymentRepository.markAsFailed(razorpayOrderId, "Invalid signature"),
                enrollmentRepository.failEnrollment(razorpayOrderId),
            ]);

            throw new AppError(
                "Payment verification failed",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.BAD_REQUEST
            );
        }

        // 2️⃣ Start Mongo Transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 3️⃣ Fetch payment inside transaction
            const payment = await paymentRepository.findByOrderId(
                razorpayOrderId,
                session
            );

            if (!payment) {
                throw new AppError(
                    "Payment not found",
                    STATUSCODE.NOT_FOUND,
                    ERROR_CODE.NOT_FOUND
                );
            }

            if (payment.userId.toString() !== userId) {
                throw new AppError(
                    "Unauthorized payment access",
                    STATUSCODE.FORBIDDEN,
                    ERROR_CODE.FORBIDDEN
                );
            }

            // 4️⃣ Idempotent conditional update
            const updateResult = await paymentRepository.markAsPaidConditionally(
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
                session
            );

            // If already processed → exit safely
            if (updateResult.modifiedCount === 0) {
                logger.info("Payment already processed", { razorpayOrderId });

                await session.commitTransaction();
                session.endSession();

                const existingEnrollment =
                    await enrollmentRepository.findActiveEnrollment(
                        userId,
                        payment.courseId.toString()
                    );

                return {
                    message: "Payment already verified",
                    enrollment: existingEnrollment,
                    payment,
                };
            }

            // 5️⃣ Activate enrollment
            const enrollment =
                await enrollmentRepository.activateEnrollment(
                    razorpayOrderId,
                    razorpayPaymentId,
                    session
                );

            if (!enrollment) {
                throw new Error("Enrollment activation failed");
            }

            // 6️⃣ Increment course enrollment
            await courseRepository.updateById(
                payment.courseId.toString(),
                { $inc: { totalEnrollments: 1 } },
                session
            );

            // 7️⃣ Increment coupon safely (by ID)
            if (payment.couponId) {
                await courseCouponRepository.updateOne(
                    { _id: payment.couponId },
                    {
                        $inc: {
                            timesUsed: 1,
                            "metadata.totalDiscountGiven":
                                payment.discountAmount || 0,
                            "metadata.totalOrdersApplied": 1,
                        },
                        $set: { updatedAt: new Date() },
                    },
                    session
                );
            }

            // 8️⃣ Commit Transaction
            await session.commitTransaction();
            session.endSession();

            logger.info("Payment DB transaction committed", {
                razorpayOrderId,
            });

            // 9️⃣ Post-processing (outside transaction)
            await Promise.allSettled([
                sessionService.addCourseToUserCache(userId, {
                    courseId: payment.courseId.toString(),
                    enrollmentId: enrollment._id.toString(),
                    purchasedAt: Date.now(),
                }),

                classroomService.invalidateClassroomCache(userId),

                (async () => {
                    const user = await authRepository.findUserById(userId);
                    if (user?.email) {
                        await addEmailJob(
                            emailQueue,
                            EMAIL_JOB_NAMES.PAYMENT_SUCCESS,
                            {
                                to: user.email,
                                userName: user.name,
                                courseTitle:
                                    (payment.notes as any)?.get?.(
                                        "courseTitle"
                                    ) || "Course",
                                amount: payment.amount,
                                currency: payment.currency,
                                orderId: razorpayOrderId,
                            }
                        );
                    }
                })(),
            ]);

            logger.info("Payment verification completed successfully", {
                userId,
                courseId: payment.courseId,
                couponApplied: !!payment.couponId,
            });

            return {
                message:
                    "Payment verified successfully. Enrollment activated.",
                enrollment,
            };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            logger.error("Payment verification failed", {
                razorpayOrderId,
                error,
            });

            throw error;
        }
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
