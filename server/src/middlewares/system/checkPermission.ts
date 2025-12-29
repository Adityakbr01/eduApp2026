import type { NextFunction, Request, Response } from "express";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import AppError from "src/utils/AppError.js";

const checkPermission = (permission: string) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            return next(new AppError("Login required", STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED, [{ path: "auth", message: "User not logged in" }]));
        }


        if (!user.permissions || !user.permissions.includes(permission)) {
            return next(new AppError("Permission Denied", STATUSCODE.FORBIDDEN, ERROR_CODE.FORBIDDEN, [{ path: "permissions", message: "User does not have the required permission" }]));
        }

        next();
    };
};

export default checkPermission;
