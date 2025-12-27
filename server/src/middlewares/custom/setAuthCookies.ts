import type { Response } from "express";
import {
    accessTokenCookieOptions,
    refreshTokenCookieOptions,
} from "src/configs/cookie.js";

export const setAuthCookies = (
    res: Response,
    accessToken: string
) => {
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
};
