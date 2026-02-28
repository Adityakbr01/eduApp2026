import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { env } from "./env.js"; // Ensure env is imported correctly (assumes env has OPENROUTER_API_KEY, CLIENT_URL, etc.)
import logger from "src/utils/logger.js"; // Standard logger based on the rest of the codebase
import app_info from "src/constants/app_info.js";

/**
 * OpenRouter Request Types
 */
export interface OpenRouterMessage {
    role: "user" | "assistant" | "system";
    content: string;
    name?: string;
}

export interface OpenRouterOptions {
    model?: string;
    messages: OpenRouterMessage[];
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    top_k?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    repetition_penalty?: number;
    seed?: number;
    stop?: string | string[];
    stream?: boolean;
    response_format?: { type: "json_object" };
    tools?: any[]; // For tool calling/functions
    tool_choice?: "auto" | "none" | { type: "function"; function: { name: string } };
}

export interface OpenRouterConfig {
    apiKey: string;
    baseURL?: string;
    defaultModel?: string;
    siteUrl?: string; // e.g., "https://YOUR_SITE_URL.com" for OpenRouter dashboard tracking
    siteName?: string; // e.g., "EduApp" for OpenRouter dashboard tracking
}

/**
 * Customizable OpenRouter API Client Configuration
 * Allows dynamic injection of models and parameters
 */
export class OpenRouterClient {
    private client: AxiosInstance;
    private defaultModel: string;

    constructor(config: OpenRouterConfig) {
        this.defaultModel = config.defaultModel || "meta-llama/llama-3.1-8b-instruct:free";

        // Setup axios instance with default headers required by OpenRouter
        this.client = axios.create({
            baseURL: config.baseURL || "https://openrouter.ai/api/v1",
            timeout: 150000, // 2.5 minutes timeout, within the 3 min Express max
            headers: {
                "Authorization": `Bearer ${config.apiKey}`,
                "Content-Type": "application/json",
                // Optional but recommended headers for the OpenRouter dashboard stats
                ...(config.siteUrl && { "HTTP-Referer": config.siteUrl }),
                ...(config.siteName && { "X-Title": config.siteName }),
            },
        });
    }

    /**
     * Create Chat Completion
     * Extremely customizable, pass any valid OpenRouter options
     */
    public async createChatCompletion(options: OpenRouterOptions, axiosConfig?: AxiosRequestConfig) {
        try {
            const payload = {
                model: options.model || this.defaultModel,
                messages: options.messages,
                temperature: options.temperature,
                max_tokens: options.max_tokens,
                top_p: options.top_p,
                top_k: options.top_k,
                frequency_penalty: options.frequency_penalty,
                presence_penalty: options.presence_penalty,
                repetition_penalty: options.repetition_penalty,
                seed: options.seed,
                stop: options.stop,
                stream: options.stream || false,
                response_format: options.response_format,
                tools: options.tools,
                tool_choice: options.tool_choice,
            };

            // Clean up undefined properties
            Object.keys(payload).forEach(
                (key) => payload[key as keyof typeof payload] === undefined && delete payload[key as keyof typeof payload]
            );

            const response = await this.client.post("/chat/completions", payload, axiosConfig);
            return response.data;
        } catch (error: any) {
            logger.error(`[OpenRouter API Error]: ${error?.response?.data?.error?.message || error.message}`);
            throw error;
        }
    }

    /**
     * Useful utility to quickly query the API with a single text prompt
     */
    public async generateText(prompt: string, modelOverride?: string, systemPrompt?: string, maxTokens?: number) {
        const messages: OpenRouterMessage[] = [];
        if (systemPrompt) {
            messages.push({ role: "system", content: systemPrompt });
        }
        messages.push({ role: "user", content: prompt });

        const result = await this.createChatCompletion({
            model: modelOverride || this.defaultModel,
            messages,
            max_tokens: maxTokens || 1000,
        });

        return result?.choices?.[0]?.message?.content || "";
    }
}

// ==========================================
// PRE-CONFIGURED INSTANCE EXPORT
// ==========================================

const openRouterAPIKey = env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || "";
const openRouterDefaultModel = env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free";

export const openRouter = new OpenRouterClient({
    apiKey: openRouterAPIKey,
    defaultModel: openRouterDefaultModel,
    siteUrl: env.CLIENT_URL,
    siteName: app_info.name,
});

export default openRouter;
