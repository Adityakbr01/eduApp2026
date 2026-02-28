export interface GenerateEmailContentParams {
    campaignType: "welcome" | "promotion" | "courseUpdate" | "newsletter" | "announcement" | "reminder" | "custom";
    targetAudience: "students" | "instructors" | "all" | "managers";
    tone: "professional" | "friendly" | "urgent" | "casual";
    language?: string;
    provider?: "gemini" | "openrouter";
    subject?: string;
    keyPoints?: string[];
    additionalContext?: string;
    brandName?: string;
    brandColor?: string;
    brandLogo?: string;
    senderName?: string;
}

export interface GeneratedEmailContent {
    subject: string;
    content: string;
    previewText: string;
}

