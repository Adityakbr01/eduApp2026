import crypto from "crypto";
import { env } from "src/configs/env.js";
import type { NextFunction, Request, Response } from "express";

const verifySignature = (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers["x-vdocipher-signature"] as string;

    const expected = crypto
        .createHmac("sha256", env.VDO_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest("hex");

    return signature === expected;
};

export default verifySignature;