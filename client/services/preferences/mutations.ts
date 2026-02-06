import { useMutation, useQueryClient } from "@tanstack/react-query";
import { preferenceApi } from "./api";
import type {
    UpdatePreferencesDTO,
    UpdateEmailPreferencesDTO,
    UpdateSecurityPreferencesDTO,
    UpdateNotificationPreferencesDTO,
    UpdateAppearancePreferencesDTO,
    UpdateRegionalPreferencesDTO,
    UpdatePrivacyPreferencesDTO,
} from "./types";
import { mutationHandlers } from "@/services/common/mutation-utils";
import { QUERY_KEYS } from "@/config/query-keys";

/**
 * Update all preferences
 */
export const useUpdatePreferences = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdatePreferencesDTO) => preferenceApi.updatePreferences(data),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Preferences updated successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.PREFERENCES],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Update email preferences
 */
export const useUpdateEmailPreferences = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateEmailPreferencesDTO) => preferenceApi.updateEmailPreferences(data),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Email preferences updated successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.PREFERENCES],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Update security preferences
 */
export const useUpdateSecurityPreferences = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateSecurityPreferencesDTO) => preferenceApi.updateSecurityPreferences(data),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Security preferences updated successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.PREFERENCES],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Update notification preferences
 */
export const useUpdateNotificationPreferences = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateNotificationPreferencesDTO) => preferenceApi.updateNotificationPreferences(data),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Notification preferences updated successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.PREFERENCES],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Update appearance preferences
 */
export const useUpdateAppearancePreferences = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateAppearancePreferencesDTO) => preferenceApi.updateAppearancePreferences(data),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Appearance preferences updated successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.PREFERENCES],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Update regional preferences
 */
export const useUpdateRegionalPreferences = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateRegionalPreferencesDTO) => preferenceApi.updateRegionalPreferences(data),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Regional preferences updated successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.PREFERENCES],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Update privacy preferences
 */
export const useUpdatePrivacyPreferences = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdatePrivacyPreferencesDTO) => preferenceApi.updatePrivacyPreferences(data),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Privacy preferences updated successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.PREFERENCES],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};
