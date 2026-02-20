import apiClient from "@/lib/api/axios";
import { Eye, PenLine, Wand2 } from "lucide-react";

// ==================== TYPES ====================

export type CampaignType = "welcome" | "promotion" | "courseUpdate" | "newsletter" | "announcement" | "reminder" | "custom";
export type TargetAudience = "students" | "instructors" | "all" | "managers";
export type EmailTone = "professional" | "friendly" | "urgent" | "casual";
export const CAMPAIGN_TYPES: {
    value: CampaignType;
    label: string;
    description: string;
}[] = [
        {
            value: "welcome",
            label: "Welcome",
            description: "Welcome new users to your platform",
        },
        {
            value: "promotion",
            label: "Promotion",
            description: "Announce sales or special offers",
        },
        {
            value: "courseUpdate",
            label: "Course Update",
            description: "Notify about course changes",
        },
        {
            value: "newsletter",
            label: "Newsletter",
            description: "Share updates and highlights",
        },
        {
            value: "announcement",
            label: "Announcement",
            description: "Important platform news",
        },
        {
            value: "reminder",
            label: "Reminder",
            description: "Gentle nudges and reminders",
        },
        { value: "custom", label: "Custom", description: "Create your own email" },
    ];


export type WizardStep = "ai" | "content" | "review";

export const STEPS: {
    id: WizardStep;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
}[] = [
        { id: "ai", label: "AI Settings", shortLabel: "AI", icon: Wand2 },
        { id: "content", label: "Content", shortLabel: "Edit", icon: PenLine },
        { id: "review", label: "Review", shortLabel: "Review", icon: Eye },
    ];


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
