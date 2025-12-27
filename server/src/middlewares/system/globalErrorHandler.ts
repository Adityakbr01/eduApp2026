import type { Request, Response, NextFunction } from "express";
import type AppError from "src/utils/AppError.js";
import { mapError } from "src/utils/errorMapper.js";
import logger from "src/utils/logger.js";

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    const error: AppError = mapError(err);

    // Structured logging
    logger.error("API ERROR 💥", {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        path: req.originalUrl,
        method: req.method,
        details: error.details,
        stack: err.stack,
    });

    return res.status(error.statusCode).json({
        success: false,
        error: {
            code: error.code,
            message: error.message,
            details: error.details || [],
        },
    });
};
