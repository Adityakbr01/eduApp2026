import type { Response } from "express";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { SUCCESS_CODE } from "src/constants/successCodes.js";

interface PaginatedResponse<T> {
    res: Response;
    message?: string;
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}

export const sendPaginatedResponse = <T>({
    res,
    message = SUCCESS_CODE.FETCHED,
    data,
    meta,
}: PaginatedResponse<T>) => {
    const totalPages = Math.ceil(meta.total / meta.limit);

    return res.status(STATUSCODE.OK).json({
        success: true,
        message,
        data,
        meta: {
            ...meta,
            totalPages,
            hasNextPage: meta.page < totalPages,
            hasPrevPage: meta.page > 1,
            statusCode: STATUSCODE.OK,
        },
        timestamp: new Date().toISOString(),
    });
};
