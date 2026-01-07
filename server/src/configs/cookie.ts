import { env, isProd } from "./env.js";
import type { CookieOptions } from "express";


export const accessTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProd,             // localhost dev ke liye
    sameSite: isProd ? "none" : "lax",
    maxAge: env.JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000, // e.g., 900*1000 = 15 minutes
    path: "/",                    // accessible everywhere
};

export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: env.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000,
    path: "/api/v1/auth",         // 🔥 refresh limited to auth links
};
