import express from "express";
import { monitoringController } from "../controllers/monitoring.controller.js";
import { getSystemStats } from "../controllers/monitoring/system.controller.js";

const router = express.Router();

/**
 * @route GET /api/v1/monitoring/system
 * @desc Get system health stats
 */
router.get("/system", getSystemStats);

/**
 * @route GET /api/v1/monitoring/metrics
 * @desc Get aggregated metrics
 */
router.get("/metrics", monitoringController.getMetrics);

/**
 * @route GET /api/v1/monitoring/logs
 * @desc Get logs with pagination and filtering
 */
router.get("/logs", monitoringController.getLogs);

/**
 * @route GET /api/v1/monitoring/stats
 * @desc Get high-level stats for dashboard cards
 */
router.get("/stats", monitoringController.getStats);

export default router;
