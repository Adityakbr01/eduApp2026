// ==================== INTERFACES ====================

export interface IEmailPreferences {
    marketing: boolean;
    courseUpdates: boolean;
    loginNotification: boolean;
}

export interface ISecurityPreferences {
    twoFactorEnabled: boolean;
}

export interface INotificationPreferences {
    push: boolean;
    sms: boolean;
    inApp: boolean;
}

export interface IAppearancePreferences {
    theme: "light" | "dark" | "system";
    language: string;
}

export interface IRegionalPreferences {
    timezone: string;
}

export interface IPrivacyPreferences {
    shareProfile: boolean;
    showActivity: boolean;
    allowAnalytics: boolean;
}

export interface IUserPreference {
    _id: string;
    userId: string;
    email: IEmailPreferences;
    security: ISecurityPreferences;
    notifications: INotificationPreferences;
    appearance: IAppearancePreferences;
    regional: IRegionalPreferences;
    privacy: IPrivacyPreferences;
    createdAt: string;
    updatedAt: string;
}

// ==================== DTO INTERFACES ====================

export interface UpdatePreferencesDTO {
    email?: Partial<IEmailPreferences>;
    security?: Partial<ISecurityPreferences>;
    notifications?: Partial<INotificationPreferences>;
    appearance?: Partial<IAppearancePreferences>;
    regional?: Partial<IRegionalPreferences>;
    privacy?: Partial<IPrivacyPreferences>;
}

export interface UpdateEmailPreferencesDTO extends Partial<IEmailPreferences> { }

export interface UpdateSecurityPreferencesDTO extends Partial<ISecurityPreferences> { }

export interface UpdateNotificationPreferencesDTO extends Partial<INotificationPreferences> { }

export interface UpdateAppearancePreferencesDTO extends Partial<IAppearancePreferences> { }

export interface UpdateRegionalPreferencesDTO extends Partial<IRegionalPreferences> { }

export interface UpdatePrivacyPreferencesDTO extends Partial<IPrivacyPreferences> { }

// ==================== RESPONSE TYPES ====================

export interface PreferenceResponse {
    success: boolean;
    data: IUserPreference;
    message: string;
}
