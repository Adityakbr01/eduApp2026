import { env } from "./env.js";
import type { CookieOptions } from "express";

const isProd = env.NODE_ENV === "production";

export const accessTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: false,             // localhost dev ke liye
    sameSite: "lax",           // dev me safe
    maxAge: env.JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000,
    path: "/",                    // accessible everywhere
};

export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: env.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000,
    path: "/api/v1/auth",         // 🔥 refresh limited to auth links
};
