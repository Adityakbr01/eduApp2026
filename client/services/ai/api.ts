import apiClient from "@/lib/api/axios";

// ==================== TYPES ====================

export type CampaignType = "welcome" | "promotion" | "courseUpdate" | "newsletter" | "announcement" | "reminder" | "custom";
export type TargetAudience = "students" | "instructors" | "all" | "managers";
export type EmailTone = "professional" | "friendly" | "urgent" | "casual";

export interface GenerateEmailParams {
    campaignType: CampaignType;
    targetAudience: TargetAudience;
    tone: EmailTone;
    subject?: string;
    keyPoints?: string[];
    additionalContext?: string;
    brandName?: string;
}

export interface GeneratedEmailContent {
    subject: string;
    content: string;
    previewText: string;
}

export interface ImproveEmailParams {
    content: string;
    instruction: string;
}

export interface SubjectSuggestionsParams {
    content: string;
    count?: number;
}

// ==================== API RESPONSES ====================

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// ==================== BASE PATH ====================
const BASE_PATH = "/ai";

// ==================== AI API ====================
export const aiApi = {
    /**
     * Generate email content using AI
     */
    generateEmail: async (params: GenerateEmailParams): Promise<ApiResponse<GeneratedEmailContent>> => {
        const response = await apiClient.post(`${BASE_PATH}/generate-email`, params);
        return response.data;
    },

    /**
     * Improve existing email content using AI
     */
    improveEmail: async (params: ImproveEmailParams): Promise<ApiResponse<{ improvedContent: string }>> => {
        const response = await apiClient.post(`${BASE_PATH}/improve-email`, params);
        return response.data;
    },

    /**
     * Generate email subject line suggestions
     */
    getSubjectSuggestions: async (params: SubjectSuggestionsParams): Promise<ApiResponse<{ suggestions: string[] }>> => {
        const response = await apiClient.post(`${BASE_PATH}/subject-suggestions`, params);
        return response.data;
    },
};
