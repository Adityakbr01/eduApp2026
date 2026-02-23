import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { CouponScope, CouponType } from "src/models/course/courseCoupon.model.js";
import { courseRepository } from "src/repositories/course.repository.js";
import { courseCouponRepository } from "src/repositories/courseCoupon.repository.js";
import AppError from "src/utils/AppError.js";
import logger from "src/utils/logger.js";

// ============================================
// COURSE COUPON SERVICE
// ============================================
export const courseCouponService = {
    // -------------------- CREATE COUPON --------------------
    createCoupon: async (instructorId: string, data: any) => {
        // Validation: Verify instructor owns specific courses
        if (data.scope === CouponScope.SPECIFIC_COURSES && data.applicableCourses?.length > 0) {
            for (const courseId of data.applicableCourses) {
                const isOwner = await courseRepository.isOwner(courseId, instructorId);
                if (!isOwner) {
                    throw new AppError(
                        `You don't have permission for course ${courseId}`,
                        STATUSCODE.FORBIDDEN,
                        ERROR_CODE.FORBIDDEN
                    );
                }
            }
        }

        const codeExists = await courseCouponRepository.findByCode(data.code);
        if (codeExists) {
            throw new AppError("Coupon code already exists", STATUSCODE.CONFLICT, ERROR_CODE.DUPLICATE_ENTRY);
        }

        const couponData = {
            ...data,
            createdBy: instructorId,
        };

        return courseCouponRepository.create(couponData);
    },

    // -------------------- VALIDATE COUPON --------------------
    validateCoupon: async (code: string, courseId: string, userId?: string) => {
        const coupon: any = await courseCouponRepository.findValidCoupon(code);

        if (!coupon) {
            throw new AppError("Invalid or expired coupon", STATUSCODE.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR);
        }

        // Check scope validity
        if (coupon.scope === CouponScope.SPECIFIC_COURSES) {
            const appliesToCourse = coupon.applicableCourses.some((id: any) => id.toString() === courseId.toString());
            if (!appliesToCourse) {
                throw new AppError("Coupon is not applicable to this course", STATUSCODE.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR);
            }
        }

        // Check usage limits per user
        if (userId) {
            const userUsage = coupon.usedBy.find((u: any) => u.user.toString() === userId.toString());
            if (userUsage && userUsage.usageCount >= coupon.usageLimitPerUser) {
                throw new AppError("You have reached the usage limit for this coupon", STATUSCODE.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR);
            }
        }

        // Verify course discount overlaps
        const course = await courseRepository.findById(courseId);
        if (!course) {
            throw new AppError("Course not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const pricing = course.pricing as any;
        const discountPercentage = pricing.discountPercentage || 0;
        const discountExpiresAt = pricing.discountExpiresAt;
        // Calculate original price and pre-coupon discounted price
        const originalPrice = pricing.originalPrice || pricing.price; // fallback if originalPrice isn't set properly
        const currentPrice = pricing.price; // This is the price after course discount
        let finalPrice = currentPrice;

        if (coupon.type === CouponType.PERCENTAGE) {
            const discountAmount = (currentPrice * coupon.discountValue) / 100;
            const actualDiscount = coupon.maxDiscountAmount ? Math.min(discountAmount, coupon.maxDiscountAmount) : discountAmount;
            finalPrice = Math.max(0, currentPrice - actualDiscount);
        } else if (coupon.type === CouponType.FIXED_AMOUNT) {
            finalPrice = Math.max(0, currentPrice - coupon.discountValue);
        }

        return {
            isValid: true,
            couponId: coupon._id,
            originalPrice: currentPrice, // The price the frontend sees as regular (before coupon)
            finalPrice: Math.round(finalPrice * 100) / 100,
            discountType: coupon.type,
            discountValue: coupon.discountValue,
        };
    },

    // -------------------- APPLY COUPON (Update Usage logic) --------------------
    applyCouponById: async (
        couponId: string,
        userId: string,
        data?: { discountAmount?: number }
    ) => {
        logger.info("Applying coupon usage", {
            couponId,
            userId,
        });

        const discountAmount = data?.discountAmount || 0;

        const updateResult = await courseCouponRepository.updateOne(
            { _id: couponId },
            {
                $inc: {
                    timesUsed: 1,
                    "metadata.totalDiscountGiven": discountAmount,
                    "metadata.totalOrdersApplied": 1,
                },
                $set: {
                    updatedAt: new Date(),
                },
                $push: {
                    usedBy: {
                        user: userId,
                        usageCount: 1,
                        lastUsedAt: new Date(),
                    },
                },
            }
        );

        if (updateResult.matchedCount === 0) {
            logger.error("Coupon increment failed - coupon not found", {
                couponId,
            });
            return null;
        }

        logger.info("Coupon usage incremented successfully", {
            couponId,
            userId,
            discountAmount,
        });

        return true;
    },

    // -------------------- GET INSTRUCTOR COUPONS --------------------
    getInstructorCoupons: async (instructorId: string, query: any) => {
        return courseCouponRepository.findByInstructor(instructorId, query);
    },

    // -------------------- UPDATE COUPON --------------------
    updateCoupon: async (couponId: string, instructorId: string, data: any) => {
        const coupon: any = await courseCouponRepository.findById(couponId);
        if (!coupon) {
            throw new AppError("Coupon not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        if (coupon.createdBy.toString() !== instructorId.toString()) {
            throw new AppError("Unauthorized to update this coupon", STATUSCODE.FORBIDDEN, ERROR_CODE.FORBIDDEN);
        }

        // Prevent updating code if it's already used
        if (data.code && data.code.toUpperCase() !== coupon.code && coupon.timesUsed > 0) {
            throw new AppError("Cannot change code of a coupon that has already been used", STATUSCODE.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR);
        }

        return courseCouponRepository.updateById(couponId, data);
    },

    // -------------------- DELETE COUPON --------------------
    deleteCoupon: async (couponId: string, instructorId: string) => {
        const coupon: any = await courseCouponRepository.findById(couponId);
        if (!coupon) {
            throw new AppError("Coupon not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        if (coupon.createdBy.toString() !== instructorId.toString()) {
            throw new AppError("Unauthorized to delete this coupon", STATUSCODE.FORBIDDEN, ERROR_CODE.FORBIDDEN);
        }

        return courseCouponRepository.deleteById(couponId);
    },
};

export default {
    courseCouponService
};
