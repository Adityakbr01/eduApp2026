import express from "express";

import { vdoWebhookHandler } from "src/webhooks/vdocipher.webhook.js";

const router = express.Router();

// routes/webhook.route.ts
router.post("/vdocipher", vdoWebhookHandler);


export default router;
