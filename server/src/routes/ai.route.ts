import express from "express";
import { PERMISSIONS } from "src/constants/permissions.js";
import { ROLES } from "src/constants/roles.js";
import aiController from "src/controllers/ai.controller.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkPermission from "src/middlewares/system/checkPermission.js";
import checkRole from "src/middlewares/system/checkRole.js";

const router = express.Router();

// All AI routes require authentication and campaign management permission
router.use(authMiddleware);
router.use(checkRole(ROLES.ADMIN.code, ROLES.MANAGER.code));
/**
 * @route   POST /api/v1/ai/generate-email
 * @desc    Generate email content using AI
 */
router.post("/generate-email", aiController.generateEmailContent);

/**
 * @route   POST /api/v1/ai/improve-email
 * @desc    Improve existing email content using AI
 */
router.post("/improve-email", aiController.improveEmailContent);

/**
 * @route   POST /api/v1/ai/subject-suggestions
 * @desc    Generate email subject line suggestions
 */
router.post("/subject-suggestions", aiController.generateSubjectSuggestions);

export default router;
