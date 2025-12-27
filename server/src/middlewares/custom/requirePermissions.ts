import type { NextFunction } from "express";
import AppError from "src/utils/AppError.js";

export const requirePermissions = (...required: string[]) => {
    return (req: any, _res: Response, next: NextFunction) => {
        const userPerms = req.user.permissions || [];

        const allowed = required.every(p =>
            userPerms.includes(p)
        );

        if (!allowed) {
            return next(new AppError("Forbidden", 403));
        }

        next();
    };
};
