import type { Request, Response } from "express";
import { courseCouponService } from "src/services/course/courseCoupon.service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";

// ============================================
// COURSE COUPON CONTROLLER
// ============================================
export const courseCouponController = {
    // -------------------- CREATE COUPON (INSTRUCTOR) --------------------
    createCoupon: catchAsync(async (req: Request, res: Response) => {
        const instructorId = req.user!.id;
        const result = await courseCouponService.createCoupon(instructorId, req.body);
        sendResponse(res, 201, "Coupon created successfully", result);
    }),

    // -------------------- GET INSTRUCTOR COUPONS --------------------
    getInstructorCoupons: catchAsync(async (req: Request, res: Response) => {
        const instructorId = req.user.id;
        const { page, limit, status, search } = req.query as any;
        console.log(instructorId);
        const result = await courseCouponService.getInstructorCoupons(instructorId, {
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            status,
            search,
        });
        sendResponse(res, 200, "Coupons fetched successfully", result);
    }),

    // -------------------- VALIDATE COUPON (PUBLIC/STUDENT) --------------------
    validateCoupon: catchAsync(async (req: Request, res: Response) => {
        const { code, courseId } = req.body;
        const userId = req.user?.id; // Optional, might be public validation
        const result = await courseCouponService.validateCoupon(code, courseId, userId);
        sendResponse(res, 200, "Coupon is valid", result);
    }),

    // -------------------- UPDATE COUPON --------------------
    updateCoupon: catchAsync(async (req: Request, res: Response) => {
        const instructorId = req.user!.id;
        const { id } = req.params;
        const result = await courseCouponService.updateCoupon(id, instructorId, req.body);
        sendResponse(res, 200, "Coupon updated successfully", result);
    }),

    // -------------------- DELETE COUPON --------------------
    deleteCoupon: catchAsync(async (req: Request, res: Response) => {
        const instructorId = req.user!.id;
        const { id } = req.params;
        const result = await courseCouponService.deleteCoupon(id, instructorId);
        sendResponse(res, 200, "Coupon deleted successfully", result);
    }),
};
