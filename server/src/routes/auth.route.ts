import { Router } from "express";
import { changePasswordSchema, loginSchema, registerOtpSchema, registerSchema, registerVerifyOtpSchema, verifyOtpSchema } from "src/schemas/auth.schema.js";
import { authRateLimiter } from "src/middlewares/system/rateLimit.middleware.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import { validateRequest } from "src/middlewares/custom/validateRequest.js";
import authController from "src/controllers/auth.controller.js";
const router = Router();

router.post("/register", authRateLimiter, validateRequest(registerSchema), authController.registerUser);
router.post("/register/send-otp", authRateLimiter, validateRequest(registerOtpSchema), authController.sendRegisterOtp);
router.post("/register/verify-otp", authRateLimiter, validateRequest(registerVerifyOtpSchema), authController.verifyRegisterOtp);
router.post("/login", authRateLimiter, validateRequest(loginSchema), authController.loginUser);
router.post("/reset-password/send-otp", authRateLimiter, validateRequest(registerOtpSchema), authController.sendResetPassOtp);
router.post("/reset-password/verify-otp", authRateLimiter, validateRequest(verifyOtpSchema), authController.verifyResetPassOtp);
router.post("/change-password", authRateLimiter, validateRequest(changePasswordSchema), authMiddleware, authController.changePassword);
router.post("/logout", authRateLimiter, authMiddleware, authController.logoutUser);
router.get("/me", authMiddleware, authController.getCurrentUser);
router.get("/session", authMiddleware, authController.getSession);


export default router;
