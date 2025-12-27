import type { Response } from "express";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { SUCCESS_CODE } from "src/constants/successCodes.js";

export const sendResponse = <T>(
    res: Response,
    statusCode: number = STATUSCODE.OK,
    message: string = SUCCESS_CODE.SUCCESS,
    data: T | null = null
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
        meta: {
            statusCode,
        },
    });
};
