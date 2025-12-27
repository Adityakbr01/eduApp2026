import type { Response } from "express";
import {
    accessTokenCookieOptions,
    refreshTokenCookieOptions,
} from "src/configs/cookie.js";

export const clearAuthCookies = (res: Response) => {
    res.clearCookie("accessToken", accessTokenCookieOptions);
    res.clearCookie("refreshToken", refreshTokenCookieOptions);
};
