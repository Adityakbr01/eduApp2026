import express from "express";
import { getSystemStats } from "src/controllers/monitoring/system.controller.js";
import { monitoringController } from "src/controllers/system/monitoring.controller.js";

const router = express.Router();
router.get("/logs", monitoringController.getLogs);
router.get("/metrics", monitoringController.getMetrics);

// Always keep health checks for uptime monitoring
router.get("/system", getSystemStats);
router.get("/stats", monitoringController.getStats);

export default router;
