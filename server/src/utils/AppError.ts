import { ERROR_CODE } from "constants/errorCodes.js";

export default class AppError extends Error {
    statusCode: number;
    code: ERROR_CODE;
    details?: any[];

    constructor(
        message: string,
        statusCode = 500,
        code: ERROR_CODE = ERROR_CODE.INTERNAL_ERROR,
        details: any[] = []
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
