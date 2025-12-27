import type { Request, Response, NextFunction } from "express";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import AppError from "src/utils/AppError.js";

export const notFoundHandler = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    next(
        new AppError(
            `Route not found: ${req.originalUrl}`,
            404,
            ERROR_CODE.NOT_FOUND
        )
    );
};
