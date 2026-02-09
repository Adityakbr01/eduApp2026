// ============================================
// MONITORING CONTROLLER

import { MonitoringService } from "../services/monitoring.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";

// ============================================
export const monitoringController = {
    // -------------------- GET METRICS --------------------
    getMetrics: catchAsync(async (req, res) => {
        const { service, range } = req.query;

        const metrics = await MonitoringService.getMetrics(
            service as string,
            range as string
        );

        sendResponse(res, 200, "Metrics fetched successfully", metrics);
    }),

    // -------------------- GET LOGS --------------------
    getLogs: catchAsync(async (req, res) => {
        const logs = await MonitoringService.getLogs(req.query);

        sendResponse(res, 200, "Logs fetched successfully", logs);
    }),

    // -------------------- GET STATS --------------------
    getStats: catchAsync(async (req, res) => {
        const { service } = req.query;

        const stats = await MonitoringService.getStats(service as string);

        sendResponse(res, 200, "Stats fetched successfully", stats);
    }),
};
