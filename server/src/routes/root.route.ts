
import express from "express";
import { env } from "process";
import { API_PREFIX, API_VERSION } from "src/constants/api.js";
import { sendResponse } from "src/utils/sendResponse.js";

const router = express.Router();

router.get("/", (_req, res) => {
    sendResponse(res, 200, `This is root Route for health go to ${API_PREFIX}/health`, {
        version: API_VERSION || "v1",
        environment: env.NODE_ENV || "development",
    });
}
);

export default router;


