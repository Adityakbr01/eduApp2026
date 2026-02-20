import { useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignApi } from "./api";
import type {
    CreateCampaignDTO,
    UpdateCampaignDTO,
    SendCampaignDTO,
} from "./types";
import { mutationHandlers } from "@/services/common/mutation-utils";
import { CAMPAIGN_QUERY_KEYS } from "./queries";

/**
 * Create campaign
 */
export const useCreateCampaign = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCampaignDTO) =>
            campaignApi.createCampaign(data),

        retry: false,          // 🔥 IMPORTANT
        networkMode: "always", // 🔥 IMPORTANT

        onSuccess: (response) => {
            mutationHandlers.success(
                response.message || "Campaign created successfully"
            );
            queryClient.invalidateQueries({
                queryKey: [CAMPAIGN_QUERY_KEYS.CAMPAIGNS],
            });
        },

        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Update campaign
 */
export const useUpdateCampaign = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCampaignDTO }) =>
            campaignApi.updateCampaign(id, data),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Campaign updated successfully");
            queryClient.invalidateQueries({
                queryKey: [CAMPAIGN_QUERY_KEYS.CAMPAIGNS],
            });
            queryClient.invalidateQueries({
                queryKey: [CAMPAIGN_QUERY_KEYS.CAMPAIGN, response.data._id],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Send campaign
 */
export const useSendCampaign = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data?: SendCampaignDTO }) =>
            campaignApi.sendCampaign(id, data),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Campaign sent successfully");
            queryClient.invalidateQueries({
                queryKey: [CAMPAIGN_QUERY_KEYS.CAMPAIGNS],
            });
            queryClient.invalidateQueries({
                queryKey: [CAMPAIGN_QUERY_KEYS.CAMPAIGN, response.data._id],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Cancel campaign
 */
export const useCancelCampaign = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => campaignApi.cancelCampaign(id),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Campaign cancelled successfully");
            queryClient.invalidateQueries({
                queryKey: [CAMPAIGN_QUERY_KEYS.CAMPAIGNS],
            });
            queryClient.invalidateQueries({
                queryKey: [CAMPAIGN_QUERY_KEYS.CAMPAIGN, response.data._id],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Delete campaign
 */
export const useDeleteCampaign = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => campaignApi.deleteCampaign(id),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Campaign deleted successfully");
            queryClient.invalidateQueries({
                queryKey: [CAMPAIGN_QUERY_KEYS.CAMPAIGNS],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};
