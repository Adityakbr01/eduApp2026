export interface GenerateEmailContentParams {
    campaignType: "welcome" | "promotion" | "courseUpdate" | "newsletter" | "announcement" | "reminder" | "custom";
    targetAudience: "students" | "instructors" | "all" | "managers";
    tone: "professional" | "friendly" | "urgent" | "casual";
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

