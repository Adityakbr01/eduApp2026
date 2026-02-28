import { AImodel } from "src/configs/GEMINI_CONF.js";
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
        const prompt = buildEmailPrompt(params);
        let text = "";

        try {
            if (!process.env.GEMINI_API_KEY) {
                throw new AppError("Gemini service not configured", STATUSCODE.SERVICE_UNAVAILABLE, ERROR_CODE.SERVICE_UNAVAILABLE);
            }
            const result = await AImodel.generateContent(prompt);
            text = result.response.text();

            // Parse the JSON response
            let cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanedText = jsonMatch[0];
            }
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
                console.error("[AI Service] JSON Parse Error. Raw AI output:", text);
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
        instruction: string,
        language?: string,
        provider?: "gemini" | string
    ): Promise<{ improvedContent: string }> => {
        const prompt = buildImproveEmailPrompt(content, instruction, language);
        let text = "";

        try {
            if (!process.env.GEMINI_API_KEY) {
                throw new AppError("Gemini service not configured", STATUSCODE.SERVICE_UNAVAILABLE, ERROR_CODE.SERVICE_UNAVAILABLE);
            }
            const result = await AImodel.generateContent(prompt);
            text = result.response.text();
            const improvedContent = text.replace(/```html\n?|\n?```/g, "").trim();

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
        count: number = 5,
        language?: string,
        provider?: "gemini" | string
    ): Promise<{ suggestions: string[] }> => {
        const prompt = buildSubjectSuggestionsPrompt(content, count, language);
        let text = "";

        try {

            if (!process.env.GEMINI_API_KEY) {
                throw new AppError("Gemini service not configured", STATUSCODE.SERVICE_UNAVAILABLE, ERROR_CODE.SERVICE_UNAVAILABLE);
            }
            const result = await AImodel.generateContent(prompt);
            text = result.response.text();

            let cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
            const jsonArrayMatch = cleanedText.match(/\[[\s\S]*\]/);
            if (jsonArrayMatch) {
                cleanedText = jsonArrayMatch[0];
            }
            const suggestions = JSON.parse(cleanedText) as string[];

            return { suggestions: suggestions.slice(0, count) };
        } catch (error) {
            if (error instanceof SyntaxError) {
                console.error("[AI Service] Array Parse Error. Raw AI output:", text);
            }
            throw new AppError(
                "Failed to generate subject suggestions",
                STATUSCODE.INTERNAL_SERVER_ERROR,
                ERROR_CODE.INTERNAL_ERROR
            );
        }
    },
};

export default aiService;




