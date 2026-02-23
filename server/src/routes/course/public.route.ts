import { Router } from "express";
import courseController from "src/controllers/course/course.controller.js";
import { courseCouponController } from "src/controllers/course/courseCoupon.controller.js";
import { validateCouponSchema } from "src/schemas/course.schema.js";
import { validateRequest } from "src/middlewares/custom/validateRequest.js";

const publicRouter = Router();

// ============================================
// 🌐 PUBLIC ROUTES (No auth required)
// These must be AFTER subrouters to avoid matching "instructor" or "student" as :id
// ============================================

publicRouter.get("/", courseController.getAllPublishedCourses);
publicRouter.get("/featured", courseController.getFeaturedCourses);

// Coupon Validate
publicRouter.post("/coupons/validate", validateRequest(validateCouponSchema), courseCouponController.validateCoupon);

publicRouter.get("/:id", courseController.getPublishedCourseById);

export default publicRouter;
