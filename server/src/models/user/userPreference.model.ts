import { Schema, model, Types } from "mongoose";

// Email preferences interface
export interface IEmailPreferences {
    marketing: boolean;
    courseUpdates: boolean;
    loginNotification: boolean;
}

// Security preferences interface
export interface ISecurityPreferences {
    twoFactorEnabled: boolean;
}

// Notification preferences interface
export interface INotificationPreferences {
    push: boolean;
    sms: boolean;
    inApp: boolean;
}

// Appearance preferences interface
export interface IAppearancePreferences {
    theme: "light" | "dark" | "system";
    language: string; // ISO language code (en, hi, es, etc.)
}

// Regional preferences interface
export interface IRegionalPreferences {
    timezone: string; // IANA timezone (e.g., "Asia/Kolkata")
}

// Privacy preferences interface
export interface IPrivacyPreferences {
    shareProfile: boolean;
    showActivity: boolean;
    allowAnalytics: boolean;
}

// FCM Token interface
export interface IFCMToken {
    token: string;
    platform: "web" | "android" | "ios" | "unknown";
    notificationsEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Main user preference interface
export interface IUserPreference {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    email: IEmailPreferences;
    security: ISecurityPreferences;
    notifications: INotificationPreferences;
    appearance: IAppearancePreferences;
    regional: IRegionalPreferences;
    privacy: IPrivacyPreferences;
    fcmTokens: IFCMToken[];
    createdAt: Date;
    updatedAt: Date;
}

// Email preferences schema
const emailPreferencesSchema = new Schema<IEmailPreferences>(
    {
        marketing: {
            type: Boolean,
            default: false,
            required: true,
        },
        courseUpdates: {
            type: Boolean,
            default: true,
            required: true,
        },
        loginNotification: {
            type: Boolean,
            default: true,
            required: true,
        },
    },
    { _id: false }
);

// Security preferences schema
const securityPreferencesSchema = new Schema<ISecurityPreferences>(
    {
        twoFactorEnabled: {
            type: Boolean,
            default: false,
            required: true,
        },
    },
    { _id: false }
);

// Notification preferences schema
const notificationPreferencesSchema = new Schema<INotificationPreferences>(
    {
        push: {
            type: Boolean,
            default: true,
            required: true,
        },
        sms: {
            type: Boolean,
            default: false,
            required: true,
        },
        inApp: {
            type: Boolean,
            default: true,
            required: true,
        },
    },
    { _id: false }
);

// Appearance preferences schema
const appearancePreferencesSchema = new Schema<IAppearancePreferences>(
    {
        theme: {
            type: String,
            enum: ["light", "dark", "system"],
            default: "system",
            required: true,
        },
        language: {
            type: String,
            default: "en",
            required: true,
            validate: {
                validator: (v: string) => /^[a-z]{2}(-[A-Z]{2})?$/.test(v),
                message: "Language must be a valid ISO code (e.g., en, hi, en-US)",
            },
        },
    },
    { _id: false }
);

// Regional preferences schema
const regionalPreferencesSchema = new Schema<IRegionalPreferences>(
    {
        timezone: {
            type: String,
            default: "Asia/Kolkata",
            required: true,
        },
    },
    { _id: false }
);

// Privacy preferences schema
const privacyPreferencesSchema = new Schema<IPrivacyPreferences>(
    {
        shareProfile: {
            type: Boolean,
            default: true,
            required: true,
        },
        showActivity: {
            type: Boolean,
            default: true,
            required: true,
        },
        allowAnalytics: {
            type: Boolean,
            default: true,
            required: true,
        },
    },
    { _id: false }
);

// FCM Token schema
const fcmTokenSchema = new Schema<IFCMToken>(
    {
        token: {
            type: String,
            required: true
        },
        platform: {
            type: String,
            enum: ["web", "android", "ios", "unknown"],
            default: "unknown"
        },
        notificationsEnabled: {
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true
    }
);

// Main user preference schema
const userPreferenceSchema = new Schema<IUserPreference>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        email: {
            type: emailPreferencesSchema,
            default: () => ({}),
            required: true,
        },
        security: {
            type: securityPreferencesSchema,
            default: () => ({}),
            required: true,
        },
        notifications: {
            type: notificationPreferencesSchema,
            default: () => ({}),
            required: true,
        },
        appearance: {
            type: appearancePreferencesSchema,
            default: () => ({}),
            required: true,
        },
        regional: {
            type: regionalPreferencesSchema,
            default: () => ({}),
            required: true,
        },
        privacy: {
            type: privacyPreferencesSchema,
            default: () => ({}),
            required: true,
        },
        fcmTokens: {
            type: [fcmTokenSchema],
            default: () => [],
        },
    },
    {
        timestamps: true,
    }
);


const UserPreferenceModel = model<IUserPreference>("UserPreference", userPreferenceSchema);

export default UserPreferenceModel;
