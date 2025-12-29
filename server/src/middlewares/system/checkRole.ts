import type { NextFunction } from "express";
import type { Request, Response } from "express";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { ROLES } from "src/constants/roles.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import AppError from "src/utils/AppError.js";

const checkRole = (...allowedRoles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const userRole = req.user?.roleName;
        if (!userRole) {
            return next(
                new AppError("User role not found. Access denied.", STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED, [{ path: "role", message: "User role is missing" }])
            );
        }

        // ✅ Admin Bypass Logic
        if (userRole === ROLES.ADMIN.code) {
            return next();
        }

        if (!allowedRoles.includes(userRole)) {
            return next(
                new AppError("Access denied. Insufficient role permissions.", STATUSCODE.FORBIDDEN, ERROR_CODE.FORBIDDEN, [{ path: "role", message: "User does not have the required role" }])
            );
        }

        next();
    };
};

export default checkRole;
