import { env } from "src/configs/env.js";
import genAI, { AImodel } from "src/configs/GEMINI_CONF.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { buildEmailPrompt, buildImproveEmailPrompt, buildSubjectSuggestionsPrompt } from "src/prompts/emailPrompt.builder.js";
import type { GeneratedEmailContent, GenerateEmailContentParams } from "src/types/ai.type.js";
import AppError from "src/utils/AppError.js";





export const aiService = {
    /**
     * Generate email content using Gemini AI
     */
    generateEmailContent: async (params: GenerateEmailContentParams): Promise<GeneratedEmailContent> => {
        if (!process.env.GEMINI_API_KEY) {
            throw new AppError(
                "AI service not configured",
                STATUSCODE.SERVICE_UNAVAILABLE,
                ERROR_CODE.SERVICE_UNAVAILABLE
            );
        }

        const prompt = buildEmailPrompt(params);

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

        const prompt = buildImproveEmailPrompt(content, instruction);

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

        const prompt = buildSubjectSuggestionsPrompt(content, count);

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




