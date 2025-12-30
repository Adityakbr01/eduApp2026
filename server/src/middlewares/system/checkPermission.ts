import type { NextFunction, Request, Response } from "express";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import sessionService from "src/services/session.service.js";
import userPermissionService from "src/services/userPermission.service.js";
import AppError from "src/utils/AppError.js";

const checkPermission = (requiredPermission: string) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        const user = req.user;
        if (!user) return next(new AppError("Login required", STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED));

        // Redis se permissions fetch karo
        const permissions = await userPermissionService.getEffectivePermissions(user.id);

        console.log("User Permissions:", permissions);

        const hasPermission = permissions.some(p => p.code === requiredPermission);
        if (!hasPermission) return next(new AppError(`Missing permission: ${requiredPermission}`, STATUSCODE.FORBIDDEN, ERROR_CODE.FORBIDDEN));

        next();
    };
};


export default checkPermission;
