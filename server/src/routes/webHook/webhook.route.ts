import express from "express";
import { vdoWebhookHandler } from "src/webhooks/vdocipher.webhook.js";

const router = express.Router();

// routes/webhook.route.ts
// VdoCipher webhook must be a POST request to receive payload data.
router.post("/vdocipher", vdoWebhookHandler);

export default router;
