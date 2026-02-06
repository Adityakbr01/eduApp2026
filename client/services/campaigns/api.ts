import apiClient from "@/lib/api/axios";
import type {
    CampaignResponse,
    CampaignsResponse,
    CampaignStatsResponse,
    CreateCampaignDTO,
    UpdateCampaignDTO,
    SendCampaignDTO,
    QueryCampaignsDTO,
} from "./types";

// ==================== BASE PATH ====================
const BASE_PATH = "/campaigns";

// ==================== CAMPAIGN API ====================
export const campaignApi = {
    /**
     * Get all campaigns with filters
     */
    getCampaigns: async (params?: QueryCampaignsDTO): Promise<CampaignsResponse> => {
        const response = await apiClient.get(BASE_PATH, { params });
        return response.data;
    },

    /**
     * Get campaign by ID
     */
    getCampaign: async (id: string): Promise<CampaignResponse> => {
        const response = await apiClient.get(`${BASE_PATH}/${id}`);
        return response.data;
    },

    /**
     * Create a new campaign
     */
    createCampaign: async (data: CreateCampaignDTO): Promise<CampaignResponse> => {
        const response = await apiClient.post(BASE_PATH, data);
        return response.data;
    },

    /**
     * Update campaign (draft only)
     */
    updateCampaign: async (id: string, data: UpdateCampaignDTO): Promise<CampaignResponse> => {
        const response = await apiClient.put(`${BASE_PATH}/${id}`, data);
        return response.data;
    },

    /**
     * Send or schedule campaign
     */
    sendCampaign: async (id: string, data?: SendCampaignDTO): Promise<CampaignResponse> => {
        const response = await apiClient.post(`${BASE_PATH}/${id}/send`, data || {});
        return response.data;
    },

    /**
     * Cancel scheduled campaign
     */
    cancelCampaign: async (id: string): Promise<CampaignResponse> => {
        const response = await apiClient.post(`${BASE_PATH}/${id}/cancel`);
        return response.data;
    },

    /**
     * Delete campaign (draft only)
     */
    deleteCampaign: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete(`${BASE_PATH}/${id}`);
        return response.data;
    },

    /**
     * Get campaign statistics
     */
    getCampaignStats: async (id: string): Promise<CampaignStatsResponse> => {
        const response = await apiClient.get(`${BASE_PATH}/${id}/stats`);
        return response.data;
    },
};
