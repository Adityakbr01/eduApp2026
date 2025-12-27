import { ZodType, ZodError } from "zod"; // normal import, type import mat use karo
import type { Request, Response, NextFunction } from "express";

/**
 * Middleware to validate request body, query, params or files
 * @param schema Zod schema to validate
 * @param target "body" | "query" | "params" | "file" | "files" | "all"
 */
export const validateRequest = <T extends ZodType<any>>(
    schema: T,
    target: "body" | "query" | "params" | "file" | "files" | "all" = "body"
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            switch (target) {
                case "body":
                    schema.parse(req.body);
                    break;
                case "query":
                    schema.parse(req.query);
                    break;
                case "params":
                    schema.parse(req.params);
                    break;
                case "file":
                    schema.parse(req.file);
                    break;
                case "files":
                    schema.parse(req.files);
                    break;
                case "all":
                    schema.parse({
                        body: req.body ?? {},
                        query: req.query ?? {},
                        params: req.params ?? {},
                        file: req.file,
                        files: req.files,
                    });
                    break;
                default:
                    schema.parse(req.body);
            }
            next();
        } catch (error: any) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Validation failed",
                        details: error.issues.map((e) => ({
                            field: e.path.join("."),
                            message: e.message,
                        })),
                    },
                });
            }
            next(error);
        }
    };
};
