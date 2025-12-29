import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import AppError from "src/utils/AppError.js";
import { env } from "src/configs/env.js";
import sessionService from "src/services/session.service.js";
import logger from "src/utils/logger.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";

interface AccessTokenPayload extends JwtPayload {
    userId: string;
    roleId: string;
    sessionId: string;
    roleName: string;
}

const authMiddleware = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        // 1️⃣ Extract access token
        const accessToken =
            req.cookies?.accessToken ||
            req.headers.authorization?.replace("Bearer ", "");

        if (!accessToken) {
            throw new AppError(ERROR_CODE.UNAUTHORIZED, STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED, [
                {
                    path: "",
                    message: "Unauthorized",
                }
            ]);
        }

        // 2️⃣ Verify JWT
        const decoded = jwt.verify(
            accessToken,
            env.JWT_ACCESS_TOKEN_SECRET
        ) as AccessTokenPayload;

        if (!decoded.userId || !decoded.sessionId) {
            throw new AppError(ERROR_CODE.UNAUTHORIZED, STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED, [
                {
                    path: "",
                    message: "Invalid token payload",
                }
            ]);
        }


        // 3️⃣ Validate Redis session (single-device)
        const isValidSession = await sessionService.validateSession(
            decoded.userId,
            decoded.sessionId
        );

        if (!isValidSession) {
            throw new AppError(
                ERROR_CODE.UNAUTHORIZED,
                STATUSCODE.UNAUTHORIZED,
                ERROR_CODE.UNAUTHORIZED,
                [
                    {
                        path: "",
                        message: "Session expired. Logged in on another device.",
                    }
                ]
            );
        }

        // 4️⃣ Fetch session snapshot (permissions)
        const session = await sessionService.getSession(decoded.userId);

        if (!session) {
            logger.warn("❌ Session not found in Redis after validation", {
                userId: decoded.userId,
            });
            throw new AppError(ERROR_CODE.UNAUTHORIZED, STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED, [
                {
                    path: "",
                    message: "Session expired",
                }
            ]);
        }
        // 5️⃣ Attach minimal user context
        req.user = {
            id: decoded.userId,
            roleId: decoded.roleId,
            sessionId: decoded.sessionId,
            roleName: decoded.roleName,
            permissions: decoded.permissions || [],
        };
        next();
    } catch (err: any) {
        if (err?.name === "TokenExpiredError") {
            logger.warn("⏰ Access token expired", {
                path: req.originalUrl,
            });
            return next(new AppError(ERROR_CODE.TOKEN_EXPIRED, STATUSCODE.UNAUTHORIZED, ERROR_CODE.TOKEN_EXPIRED, [
                {
                    path: "",
                    message: "Token expired",
                }
            ]));
        }

        return next(new AppError(ERROR_CODE.UNAUTHORIZED, STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED, [
            {
                path: "",
                message: "Authentication failed",
            }
        ],));
    }
};

export default authMiddleware;
