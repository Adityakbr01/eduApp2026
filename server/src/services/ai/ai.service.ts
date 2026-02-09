import { env } from "src/configs/env.js";
import genAI, { AImodel } from "src/configs/GEMINI_CONF.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { AUDIENCE_CONTEXT, EMAIL_TEMPLATES, TONE_GUIDELINES } from "src/constants/GEMINI_CONST.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import type { GeneratedEmailContent, GenerateEmailContentParams } from "src/types/ai.type.js";
import AppError from "src/utils/AppError.js";





export const aiService = {
    /**
     * Generate email content using Gemini AI
     */
    generateEmailContent: async (params: GenerateEmailContentParams): Promise<GeneratedEmailContent> => {
        const {
            campaignType,
            targetAudience,
            tone,
            subject,
            keyPoints,
            additionalContext,
            brandName = "EduApp",
        } = params;

        if (!process.env.GEMINI_API_KEY) {
            throw new AppError(
                "AI service not configured",
                STATUSCODE.SERVICE_UNAVAILABLE,
                ERROR_CODE.SERVICE_UNAVAILABLE
            );
        }

        const prompt = `You are an expert email marketing copywriter. Generate a compelling email for an education platform called "${brandName}".

EMAIL TYPE: ${EMAIL_TEMPLATES[campaignType]}

TARGET AUDIENCE: ${AUDIENCE_CONTEXT[targetAudience]}

TONE: ${TONE_GUIDELINES[tone]}

${subject ? `SUGGESTED SUBJECT: ${subject}` : ""}

${keyPoints && keyPoints.length > 0 ? `KEY POINTS TO INCLUDE:\n${keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}` : ""}

${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ""}

Generate the email in the following JSON format (respond with ONLY valid JSON, no markdown):
{
  "subject": "A compelling email subject line (max 60 characters)",
  "previewText": "A short preview text that appears in email clients (max 100 characters)",
  "content": "Full HTML email content with proper structure. Use semantic HTML. Include a clear call-to-action. Keep it concise but engaging."
}

HTML GUIDELINES:
- Use a clean, modern structure with proper headings (h1, h2, h3)
- Include a greeting, main content, call-to-action button, and sign-off
- Use inline styles for email compatibility
- Make the CTA button prominent with styling like: style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;"
- Keep paragraphs short and scannable
- Include appropriate spacing between sections`;

        try {
            const result = await AImodel.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Parse the JSON response
            const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
            const parsed = JSON.parse(cleanedText) as GeneratedEmailContent;

            // Validate the response
            if (!parsed.subject || !parsed.content) {
                throw new Error("Invalid AI response structure");
            }

            return {
                subject: parsed.subject,
                content: parsed.content,
                previewText: parsed.previewText || "",
            };
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new AppError(
                    "Failed to parse AI response",
                    STATUSCODE.INTERNAL_SERVER_ERROR,
                    ERROR_CODE.INTERNAL_ERROR
                );
            }
            throw error;
        }
    },

    /**
     * Improve existing email content using AI
     */
    improveEmailContent: async (
        content: string,
        instruction: string
    ): Promise<{ improvedContent: string }> => {
        if (!process.env.GEMINI_API_KEY) {
            throw new AppError(
                "AI service not configured",
                STATUSCODE.SERVICE_UNAVAILABLE,
                ERROR_CODE.SERVICE_UNAVAILABLE
            );
        }


        const prompt = `You are an expert email copywriter. Improve the following email content based on this instruction: "${instruction}"

CURRENT EMAIL CONTENT:
${content}

INSTRUCTIONS:
1. Maintain the original structure and key message
2. Apply the requested improvements
3. Keep Email compatibility with inline styles
4. Return ONLY the improved HTML content, no explanations

Respond with ONLY the improved HTML content.`;

        try {
            const result = await AImodel.generateContent(prompt);
            const response = result.response;
            const improvedContent = response.text().replace(/```html\n?|\n?```/g, "").trim();

            return { improvedContent };
        } catch (error) {
            throw new AppError(
                "Failed to improve email content",
                STATUSCODE.INTERNAL_SERVER_ERROR,
                ERROR_CODE.INTERNAL_ERROR
            );
        }
    },

    /**
     * Generate email subject line suggestions
     */
    generateSubjectSuggestions: async (
        content: string,
        count: number = 5
    ): Promise<{ suggestions: string[] }> => {
        if (!process.env.GEMINI_API_KEY) {
            throw new AppError(
                "AI service not configured",
                STATUSCODE.SERVICE_UNAVAILABLE,
                ERROR_CODE.SERVICE_UNAVAILABLE
            );
        }


        const prompt = `Based on the following email content, generate ${count} compelling subject line suggestions. Each should be unique in approach (e.g., question, urgency, benefit-focused, curiosity).

EMAIL CONTENT:
${content}

Respond with ONLY a JSON array of strings, no other text:
["Subject 1", "Subject 2", ...]`;

        try {
            const result = await AImodel.generateContent(prompt);
            const response = result.response;
            const text = response.text().replace(/```json\n?|\n?```/g, "").trim();
            const suggestions = JSON.parse(text) as string[];

            return { suggestions: suggestions.slice(0, count) };
        } catch (error) {
            throw new AppError(
                "Failed to generate subject suggestions",
                STATUSCODE.INTERNAL_SERVER_ERROR,
                ERROR_CODE.INTERNAL_ERROR
            );
        }
    },
};

export default aiService;




