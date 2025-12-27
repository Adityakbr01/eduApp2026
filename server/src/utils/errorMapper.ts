import { ZodError } from "zod";
import AppError from "./AppError.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";

export const mapError = (err: any): AppError => {
    // Zod validation
    if (err instanceof ZodError) {
        return new AppError(
            "Validation failed",
            400,
            ERROR_CODE.VALIDATION_ERROR,
            err.issues.map(e => ({
                field: e.path.join("."),
                message: e.message,
            }))
        );
    }

    // Mongo duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return new AppError(
            `${field} already exists`,
            409,
            ERROR_CODE.DUPLICATE_RESOURCE
        );
    }

    // Prisma duplicate
    if (err.code === "P2002") {
        return new AppError(
            "Duplicate field value",
            409,
            ERROR_CODE.DUPLICATE_RESOURCE
        );
    }

    // Already AppError
    if (err instanceof AppError) return err;

    // Unknown
    return new AppError(
        "Internal server error",
        500,
        ERROR_CODE.INTERNAL_ERROR
    );
};
