import express from "express";
import { ROLES } from "src/constants/roles.js";
import aiController from "src/controllers/ai/ai.controller.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkRole from "src/middlewares/system/checkRole.js";

const router = express.Router();

/**
 * 🔥 AI ROUTE TIMEOUT OVERRIDE (IMPORTANT)
 * Sirf AI routes ke liye
 */
router.use((req, res, next) => {
    req.setTimeout(180000);       // disable request timeout 3 mint
    res.setTimeout(180000);       // disable response timeout 3 mint
    next();
});

// Auth & role checks
router.use(authMiddleware);
router.use(checkRole(ROLES.ADMIN.code, ROLES.MANAGER.code));

/**
 * @route   POST /api/v1/ai/generate-email
 */
router.post("/generate-email", aiController.generateEmailContent);

/**
 * @route   POST /api/v1/ai/improve-email
 */
router.post("/improve-email", aiController.improveEmailContent);

/**
 * @route   POST /api/v1/ai/subject-suggestions
 */
router.post("/subject-suggestions", aiController.generateSubjectSuggestions);

export default router;
