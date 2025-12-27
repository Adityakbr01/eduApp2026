import type { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRequestHandler<
    P = Record<string, string>,
    ResBody = any,
    ReqBody = any,
    ReqQuery = qs.ParsedQs
> = (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
) => Promise<void | Response>;

import type qs from "qs";

export const catchAsync = <
    P = Record<string, string>,
    ResBody = any,
    ReqBody = any,
    ReqQuery = qs.ParsedQs
>(
    fn: AsyncRequestHandler<P, ResBody, ReqBody, ReqQuery>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> =>
    (req, res, next) =>
        Promise.resolve(fn(req, res, next)).catch(next);
