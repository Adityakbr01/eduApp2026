import type { Types, UpdateQuery } from "mongoose";
import UserPreferenceModel, {
    type IEmailPreferences,
    type ISecurityPreferences,
    type INotificationPreferences,
    type IAppearancePreferences,
    type IRegionalPreferences,
    type IPrivacyPreferences
} from "src/models/user/userPreference.model.js";

// ============================================
// USER PREFERENCE REPOSITORY
// ============================================
export const userPreferenceRepository = {
    /**
     * Find preferences by user ID
     */
    findByUserId: async (userId: string | Types.ObjectId) => {
        return UserPreferenceModel.findOne({ userId }).lean();
    },

    /**
     * Create or update preferences (upsert)
     */
    upsert: async (userId: string | Types.ObjectId, data: any) => {
        return UserPreferenceModel.findOneAndUpdate(
            { userId },
            { $set: data },
            { upsert: true, new: true, runValidators: true }
        ).lean();
    },

    /**
     * Update email preferences only
     */
    updateEmailPreferences: async (
        userId: string | Types.ObjectId,
        emailPrefs: Partial<IEmailPreferences>
    ) => {
        const updateData: any = {};

        if (emailPrefs.marketing !== undefined) {
            updateData["email.marketing"] = emailPrefs.marketing;
        }
        if (emailPrefs.courseUpdates !== undefined) {
            updateData["email.courseUpdates"] = emailPrefs.courseUpdates;
        }
        if (emailPrefs.loginNotification !== undefined) {
            updateData["email.loginNotification"] = emailPrefs.loginNotification;
        }

        return UserPreferenceModel.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { upsert: true, new: true, runValidators: true }
        ).lean();
    },

    /**
     * Update security preferences only
     */
    updateSecurityPreferences: async (
        userId: string | Types.ObjectId,
        securityPrefs: Partial<ISecurityPreferences>
    ) => {
        const updateData: any = {};

        if (securityPrefs.twoFactorEnabled !== undefined) {
            updateData["security.twoFactorEnabled"] = securityPrefs.twoFactorEnabled;
        }

        return UserPreferenceModel.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { upsert: true, new: true, runValidators: true }
        ).lean();
    },

    /**
     * Update notification preferences only
     */
    updateNotificationPreferences: async (
        userId: string | Types.ObjectId,
        notificationPrefs: Partial<INotificationPreferences>
    ) => {
        const updateData: any = {};

        if (notificationPrefs.push !== undefined) {
            updateData["notifications.push"] = notificationPrefs.push;
        }
        if (notificationPrefs.sms !== undefined) {
            updateData["notifications.sms"] = notificationPrefs.sms;
        }
        if (notificationPrefs.inApp !== undefined) {
            updateData["notifications.inApp"] = notificationPrefs.inApp;
        }

        return UserPreferenceModel.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { upsert: true, new: true, runValidators: true }
        ).lean();
    },

    /**
     * Update appearance preferences only
     */
    updateAppearancePreferences: async (
        userId: string | Types.ObjectId,
        appearancePrefs: Partial<IAppearancePreferences>
    ) => {
        const updateData: any = {};

        if (appearancePrefs.theme !== undefined) {
            updateData["appearance.theme"] = appearancePrefs.theme;
        }
        if (appearancePrefs.language !== undefined) {
            updateData["appearance.language"] = appearancePrefs.language;
        }

        return UserPreferenceModel.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { upsert: true, new: true, runValidators: true }
        ).lean();
    },

    /**
     * Update regional preferences only
     */
    updateRegionalPreferences: async (
        userId: string | Types.ObjectId,
        regionalPrefs: Partial<IRegionalPreferences>
    ) => {
        const updateData: any = {};

        if (regionalPrefs.timezone !== undefined) {
            updateData["regional.timezone"] = regionalPrefs.timezone;
        }

        return UserPreferenceModel.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { upsert: true, new: true, runValidators: true }
        ).lean();
    },

    /**
     * Update privacy preferences only
     */
    updatePrivacyPreferences: async (
        userId: string | Types.ObjectId,
        privacyPrefs: Partial<IPrivacyPreferences>
    ) => {
        const updateData: any = {};

        if (privacyPrefs.shareProfile !== undefined) {
            updateData["privacy.shareProfile"] = privacyPrefs.shareProfile;
        }
        if (privacyPrefs.showActivity !== undefined) {
            updateData["privacy.showActivity"] = privacyPrefs.showActivity;
        }
        if (privacyPrefs.allowAnalytics !== undefined) {
            updateData["privacy.allowAnalytics"] = privacyPrefs.allowAnalytics;
        }

        return UserPreferenceModel.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { upsert: true, new: true, runValidators: true }
        ).lean();
    },

    /**
     * Initialize default preferences for a new user
     */
    createDefault: async (userId: string | Types.ObjectId) => {
        const existingPrefs = await UserPreferenceModel.findOne({ userId });

        if (existingPrefs) {
            return existingPrefs;
        }

        return UserPreferenceModel.create({
            userId,
            email: {
                marketing: false,
                courseUpdates: true,
                loginNotification: true,
            },
            security: {
                twoFactorEnabled: false,
            },
            notifications: {
                push: true,
                sms: false,
                inApp: true,
            },
            appearance: {
                theme: "system",
                language: "en",
            },
            regional: {
                timezone: "Asia/Kolkata",
            },
            privacy: {
                shareProfile: true,
                showActivity: true,
                allowAnalytics: true,
            },
        });
    },

    /**
     * Delete preferences (for user deletion)
     */
    deleteByUserId: async (userId: string | Types.ObjectId) => {
        return UserPreferenceModel.findOneAndDelete({ userId });
    },

    /**
     * Check if 2FA is enabled for a user
     */
    isTwoFactorEnabled: async (userId: string | Types.ObjectId): Promise<boolean> => {
        const prefs = await UserPreferenceModel.findOne({ userId }).select("security.twoFactorEnabled").lean();
        return prefs?.security?.twoFactorEnabled ?? false;
    },
};
