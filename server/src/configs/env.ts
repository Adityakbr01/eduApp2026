import dotenv from "dotenv";
import logger from "src/utils/logger.js";
import { z } from "zod";

dotenv.config();

export const isProd = process.env.NODE_ENV === "production";
logger.info("Environment:", process.env.NODE_ENV), isProd;


const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test", "staging", ""]).default("development"),
    PORT: z.coerce.number().default(3001),

    // Mongo
    MONGO_URI: z.string().url(),
    DB_NAME: z.string().min(3),

    // Client
    CLIENT_URL: z.string().url(),
    CLIENT_ORIGIN: z.string().default("http://localhost:3000"),
    PRODUCTION_CLIENT_URL: z.string().url(),

    // JWT
    JWT_ACCESS_TOKEN_SECRET: z.string().min(10),
    JWT_REFRESH_TOKEN_SECRET: z.string().min(10),
    JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default("7d"),
    JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"), // future use
    JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS: z.coerce.number().default(604800),
    JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS: z.coerce.number().default(604800),
    BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
    SERVER_BASE_URL: z.string().url(),

    // Email
    SMTP_PASS: z.string().min(6),
    SMTP_USER: z.string().email(),

    // BullMQ
    BULL_BOARD_PASSWORD: z.string().min(6),
    BULLMQ_WORKER_CONCURRENCY: z.coerce.number().default(5),

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: z.string().min(3),
    CLOUDINARY_API_KEY: z.string().min(6),
    CLOUDINARY_API_SECRET: z.string().min(6),

    // Resend Email Service
    RESEND_API_KEY: z.string().min(10),

    // Razorpay
    RAZORPAY_KEY_ID: z.string().min(10),
    RAZORPAY_KEY_SECRET: z.string().min(10),

    // AWS S3
    AWS_ACCESS_KEY_ID: z.string().min(10),
    AWS_SECRET_ACCESS_KEY: z.string().min(10),
    // AWS_ENDPOINT_URL_S3: z.string().url(),
    // AWS_ENDPOINT_URL_IAM: z.string().url(),
    AWS_REGION: z.string().min(2),
    AWS_S3_BUCKET_NAME: z.string().min(3),
    AWS_S3_BUCKET_NAME_PROD: z.string().min(3),
    CDN_BASE_URL: z.string().url().optional(),


    //Redis
    UPSTASH_REDIS_URL: z.string().url().optional(),
    REDIS_URL: z.string().url().optional(),

    // AI - Gemini
    GEMINI_API_KEY: z.string().min(10).optional(),
    GEMINI_MODEL: z.string().default("models/gemini-2.5-flash"),

    //Admin - credentials
    ADMIN_EMAIL: z.string().email(),
    ADMIN_PASSWORD: z.string().min(6),

});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:", parsedEnv.error.format());
    process.exit(1);
}

export const env = parsedEnv.data;
