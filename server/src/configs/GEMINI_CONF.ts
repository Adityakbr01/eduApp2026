import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env.js";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");

export const AImodel = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });

export default genAI;


