import { Router } from "express";
import {
    getUserPreferences,
    updatePreferences,
    updateEmailPreferences,
    updateSecurityPreferences,
    updateNotificationPreferences,
    updateAppearancePreferences,
    updateRegionalPreferences,
    updatePrivacyPreferences,
} from "src/controllers/user/userPreference.controller.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import { validateRequest } from "src/middlewares/custom/validateRequest.js";
import {
    updatePreferencesSchema,
    emailPreferencesSchema,
    securityPreferencesSchema,
    notificationPreferencesSchema,
    appearancePreferencesSchema,
    regionalPreferencesSchema,
    privacyPreferencesSchema,
} from "src/schemas/userPreference.schema.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get("/", getUserPreferences);

/**
 * @route   PUT /api/preferences
 * @desc    Update user preferences (full update)
 * @access  Private
 */
router.put("/", validateRequest(updatePreferencesSchema), updatePreferences);

/**
 * @route   PATCH /api/preferences/email
 * @desc    Update email preferences only
 * @access  Private
 */
router.patch("/email", validateRequest(emailPreferencesSchema), updateEmailPreferences);

/**
 * @route   PATCH /api/preferences/security
 * @desc    Update security preferences only
 * @access  Private
 */
router.patch("/security", validateRequest(securityPreferencesSchema), updateSecurityPreferences);

/**
 * @route   PATCH /api/preferences/notifications
 * @desc    Update notification preferences only
 * @access  Private
 */
router.patch("/notifications", validateRequest(notificationPreferencesSchema), updateNotificationPreferences);

/**
 * @route   PATCH /api/preferences/appearance
 * @desc    Update appearance preferences only
 * @access  Private
 */
router.patch("/appearance", validateRequest(appearancePreferencesSchema), updateAppearancePreferences);

/**
 * @route   PATCH /api/preferences/regional
 * @desc    Update regional preferences only
 * @access  Private
 */
router.patch("/regional", validateRequest(regionalPreferencesSchema), updateRegionalPreferences);

/**
 * @route   PATCH /api/preferences/privacy
 * @desc    Update privacy preferences only
 * @access  Private
 */
router.patch("/privacy", validateRequest(privacyPreferencesSchema), updatePrivacyPreferences);

export default router;
