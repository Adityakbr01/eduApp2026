import { Types } from "mongoose";
import { userPreferenceRepository } from "src/repositories/userPreference.repository.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import AppError from "src/utils/AppError.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import type {
    IEmailPreferences,
    ISecurityPreferences,
    INotificationPreferences,
    IAppearancePreferences,
    IRegionalPreferences,
    IPrivacyPreferences
} from "src/models/userPreference.model.js";

// ============================================
// USER PREFERENCE SERVICE
// ============================================
export const userPreferenceService = {
    /**
     * Get user preferences
     * Creates default preferences if they don't exist
     */
    getUserPreferences: async (userId: string) => {
        let preferences = await userPreferenceRepository.findByUserId(userId);

        // If preferences don't exist, create defaults
        if (!preferences) {
            preferences = await userPreferenceRepository.createDefault(userId);
        }

        return preferences;
    },

    /**
     * Update all preferences
     */
    updatePreferences: async (
        userId: string,
        data: {
            email?: Partial<IEmailPreferences>;
            security?: Partial<ISecurityPreferences>;
        }
    ) => {
        const updateData: any = {};

        // Build update object
        if (data.email) {
            if (data.email.marketing !== undefined) {
                updateData["email.marketing"] = data.email.marketing;
            }
            if (data.email.courseUpdates !== undefined) {
                updateData["email.courseUpdates"] = data.email.courseUpdates;
            }
            if (data.email.loginNotification !== undefined) {
                updateData["email.loginNotification"] = data.email.loginNotification;
            }
        }

        if (data.security) {
            if (data.security.twoFactorEnabled !== undefined) {
                updateData["security.twoFactorEnabled"] = data.security.twoFactorEnabled;
            }
        }

        const preferences = await userPreferenceRepository.upsert(userId, updateData);

        if (!preferences) {
            throw new AppError(
                "Failed to update preferences",
                STATUSCODE.INTERNAL_SERVER_ERROR,
                ERROR_CODE.INTERNAL_ERROR
            );
        }

        return preferences;
    },

    /**
     * Update only email preferences
     */
    updateEmailPreferences: async (userId: string, emailPrefs: Partial<IEmailPreferences>) => {
        const preferences = await userPreferenceRepository.updateEmailPreferences(userId, emailPrefs);

        if (!preferences) {
            throw new AppError(
                "Failed to update email preferences",
                STATUSCODE.INTERNAL_SERVER_ERROR,
                ERROR_CODE.INTERNAL_ERROR
            );
        }

        return preferences;
    },

    /**
     * Update only security preferences
     */
    updateSecurityPreferences: async (userId: string, securityPrefs: Partial<ISecurityPreferences>) => {
        const preferences = await userPreferenceRepository.updateSecurityPreferences(userId, securityPrefs);

        if (!preferences) {
            throw new AppError(
                "Failed to update security preferences",
                STATUSCODE.INTERNAL_SERVER_ERROR,
                ERROR_CODE.INTERNAL_ERROR
            );
        }

        return preferences;
    },


    /**
     * Initialize default preferences for a new user
     * This should be called when a new user is created
     */
    initializeDefaultPreferences: async (userId: string) => {
        return userPreferenceRepository.createDefault(userId);
    },

    /**
     * Check if 2FA is enabled for a user
     */
    isTwoFactorEnabled: async (userId: string): Promise<boolean> => {
        return userPreferenceRepository.isTwoFactorEnabled(userId);
    },

    /**
     * Update notification preferences
     */
    updateNotificationPreferences: async (userId: string, notificationPrefs: Partial<INotificationPreferences>) => {
        const preferences = await userPreferenceRepository.updateNotificationPreferences(userId, notificationPrefs);

        if (!preferences) {
            throw new AppError(
                "Failed to update notification preferences",
                STATUSCODE.INTERNAL_SERVER_ERROR,
                ERROR_CODE.INTERNAL_ERROR
            );
        }

        return preferences;
    },

    /**
     * Update appearance preferences
     */
    updateAppearancePreferences: async (userId: string, appearancePrefs: Partial<IAppearancePreferences>) => {
        const preferences = await userPreferenceRepository.updateAppearancePreferences(userId, appearancePrefs);

        if (!preferences) {
            throw new AppError(
                "Failed to update appearance preferences",
                STATUSCODE.INTERNAL_SERVER_ERROR,
                ERROR_CODE.INTERNAL_ERROR
            );
        }

        return preferences;
    },

    /**
     * Update regional preferences
     */
    updateRegionalPreferences: async (userId: string, regionalPrefs: Partial<IRegionalPreferences>) => {
        const preferences = await userPreferenceRepository.updateRegionalPreferences(userId, regionalPrefs);

        if (!preferences) {
            throw new AppError(
                "Failed to update regional preferences",
                STATUSCODE.INTERNAL_SERVER_ERROR,
                ERROR_CODE.INTERNAL_ERROR
            );
        }

        return preferences;
    },

    /**
     * Update privacy preferences
     */
    updatePrivacyPreferences: async (userId: string, privacyPrefs: Partial<IPrivacyPreferences>) => {
        const preferences = await userPreferenceRepository.updatePrivacyPreferences(userId, privacyPrefs);

        if (!preferences) {
            throw new AppError(
                "Failed to update privacy preferences",
                STATUSCODE.INTERNAL_SERVER_ERROR,
                ERROR_CODE.INTERNAL_ERROR
            );
        }

        return preferences;
    },
};

export default {
    userPreferenceService,
};
