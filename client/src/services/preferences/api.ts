import apiClient from "@/lib/api/axios";
import type {
    PreferenceResponse,
    UpdatePreferencesDTO,
    UpdateEmailPreferencesDTO,
    UpdateSecurityPreferencesDTO,
    UpdateNotificationPreferencesDTO,
    UpdateAppearancePreferencesDTO,
    UpdateRegionalPreferencesDTO,
    UpdatePrivacyPreferencesDTO,
} from "./types";

// ==================== BASE PATH ====================
const BASE_PATH = "/preferences";
const PUSH_NOTIFICATIONS_PATH = "/notifications/push";

// ==================== PREFERENCE API ====================
export const preferenceApi = {
    /**
     * Get user preferences
     */
    getPreferences: async (): Promise<PreferenceResponse> => {
        const response = await apiClient.get(BASE_PATH);
        return response.data;
    },

    /**
     * Update all preferences
     */
    updatePreferences: async (data: UpdatePreferencesDTO): Promise<PreferenceResponse> => {
        const response = await apiClient.put(BASE_PATH, data);
        return response.data;
    },

    /**
     * Update email preferences only
     */
    updateEmailPreferences: async (data: UpdateEmailPreferencesDTO): Promise<PreferenceResponse> => {
        const response = await apiClient.patch(`${BASE_PATH}/email`, data);
        return response.data;
    },

    /**
     * Update security preferences only
     */
    updateSecurityPreferences: async (data: UpdateSecurityPreferencesDTO): Promise<PreferenceResponse> => {
        const response = await apiClient.patch(`${BASE_PATH}/security`, data);
        return response.data;
    },

    /**
     * Update notification preferences only
     */
    updateNotificationPreferences: async (data: UpdateNotificationPreferencesDTO): Promise<PreferenceResponse> => {
        const response = await apiClient.patch(`${BASE_PATH}/notifications`, data);
        return response.data;
    },

    /**
     * Update appearance preferences only
     */
    updateAppearancePreferences: async (data: UpdateAppearancePreferencesDTO): Promise<PreferenceResponse> => {
        const response = await apiClient.patch(`${BASE_PATH}/appearance`, data);
        return response.data;
    },

    /**
     * Update regional preferences only
     */
    updateRegionalPreferences: async (data: UpdateRegionalPreferencesDTO): Promise<PreferenceResponse> => {
        const response = await apiClient.patch(`${BASE_PATH}/regional`, data);
        return response.data;
    },

    /**
     * Update privacy preferences only
     */
    updatePrivacyPreferences: async (data: UpdatePrivacyPreferencesDTO): Promise<PreferenceResponse> => {
        const response = await apiClient.patch(`${BASE_PATH}/privacy`, data);
        return response.data;
    },

    /**
     * Register a device token for push notifications
     */
    registerPushToken: async (data: { token: string; platform: string }): Promise<any> => {
        const response = await apiClient.post(`${PUSH_NOTIFICATIONS_PATH}/register`, data);
        return response.data;
    },
};
