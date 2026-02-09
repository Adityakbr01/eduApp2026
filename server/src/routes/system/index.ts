import { Router } from "express";
import monitoringRouter from "./monitoring.route.js";
import healthRouter from "./health.route.js";

const router = Router();

router.use("/monitoring", monitoringRouter);
router.use("/health", healthRouter);

export default router;
