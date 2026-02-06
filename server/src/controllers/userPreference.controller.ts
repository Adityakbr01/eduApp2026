import type { Request, Response } from "express";
import { userPreferenceService } from "src/services/userPreference.service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";

// ============================================
// USER PREFERENCE CONTROLLER
// ============================================

/**
 * Get user preferences
 * @route GET /api/preferences
 * @access Private
 */
export const getUserPreferences = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const preferences = await userPreferenceService.getUserPreferences(userId);

    sendResponse(res, 200, "Preferences retrieved successfully", preferences);
});

/**
 * Update user preferences
 * @route PUT /api/preferences
 * @access Private
 */
export const updatePreferences = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { email, security } = req.body;

    const preferences = await userPreferenceService.updatePreferences(userId, {
        email,
        security,
    });

    sendResponse(res, 200, "Preferences updated successfully", preferences);
});

/**
 * Update email preferences only
 * @route PATCH /api/preferences/email
 * @access Private
 */
export const updateEmailPreferences = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const emailPrefs = req.body;

    const preferences = await userPreferenceService.updateEmailPreferences(userId, emailPrefs);

    sendResponse(res, 200, "Email preferences updated successfully", preferences);
});

/**
 * Update security preferences only
 * @route PATCH /api/preferences/security
 * @access Private
 */
export const updateSecurityPreferences = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const securityPrefs = req.body;

    const preferences = await userPreferenceService.updateSecurityPreferences(userId, securityPrefs);

    sendResponse(res, 200, "Security preferences updated successfully", preferences);
});

/**
 * Update notification preferences only
 * @route PATCH /api/preferences/notifications
 * @access Private
 */
export const updateNotificationPreferences = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const notificationPrefs = req.body;

    const preferences = await userPreferenceService.updateNotificationPreferences(userId, notificationPrefs);

    sendResponse(res, 200, "Notification preferences updated successfully", preferences);
});

/**
 * Update appearance preferences only
 * @route PATCH /api/preferences/appearance
 * @access Private
 */
export const updateAppearancePreferences = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const appearancePrefs = req.body;

    const preferences = await userPreferenceService.updateAppearancePreferences(userId, appearancePrefs);

    sendResponse(res, 200, "Appearance preferences updated successfully", preferences);
});

/**
 * Update regional preferences only
 * @route PATCH /api/preferences/regional
 * @access Private
 */
export const updateRegionalPreferences = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const regionalPrefs = req.body;

    const preferences = await userPreferenceService.updateRegionalPreferences(userId, regionalPrefs);

    sendResponse(res, 200, "Regional preferences updated successfully", preferences);
});

/**
 * Update privacy preferences only
 * @route PATCH /api/preferences/privacy
 * @access Private
 */
export const updatePrivacyPreferences = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const privacyPrefs = req.body;

    const preferences = await userPreferenceService.updatePrivacyPreferences(userId, privacyPrefs);

    sendResponse(res, 200, "Privacy preferences updated successfully", preferences);
});
