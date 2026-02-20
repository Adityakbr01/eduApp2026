import { useQuery } from "@tanstack/react-query";
import { campaignApi } from "./api";
import type { QueryCampaignsDTO } from "./types";

export const CAMPAIGN_QUERY_KEYS = {
    CAMPAIGNS: "campaigns",
    CAMPAIGN: "campaign",
    STATS: "campaign-stats",
};

/**
 * Get all campaigns
 */
export const useGetCampaigns = (params?: QueryCampaignsDTO) => {
    return useQuery({
        queryKey: [CAMPAIGN_QUERY_KEYS.CAMPAIGNS, params],
        queryFn: () => campaignApi.getCampaigns(params),
    });
};

/**
 * Get single campaign
 */
export const useGetCampaign = (id: string, enabled = true) => {
    return useQuery({
        queryKey: [CAMPAIGN_QUERY_KEYS.CAMPAIGN, id],
        queryFn: () => campaignApi.getCampaign(id),
        enabled: enabled && !!id,
    });
};

/**
 * Get campaign statistics
 */
export const useGetCampaignStats = (id: string, enabled = true) => {
    return useQuery({
        queryKey: [CAMPAIGN_QUERY_KEYS.STATS, id],
        queryFn: () => campaignApi.getCampaignStats(id),
        enabled: enabled && !!id,
        refetchInterval: 5000, // Auto-refresh every 5s for live stats
    });
};
