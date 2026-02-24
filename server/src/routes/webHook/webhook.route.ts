import express from "express";

import { vdoWebhookHandler } from "src/webhooks/vdocipher.webhook.js";
import { liveStreamWebhookHandler } from "src/controllers/liveStream/liveStream.webhook.controller.js";

const router = express.Router();

// routes/webhook.route.ts
router.post("/vdocipher", vdoWebhookHandler);
router.post("/vdocipher/live", liveStreamWebhookHandler);


export default router;

