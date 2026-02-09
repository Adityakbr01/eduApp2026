import type { Request, Response } from "express";
import si from "systeminformation";
import logger from "../../utils/logger.js";

/**
 * @route GET /api/v1/monitoring/system
 * @desc Get system health stats (CPU, RAM, Uptime)
 */
export const getSystemStats = async (req: Request, res: Response) => {
    try {
        const [cpu, mem, time] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.time()
        ]);

        res.json({
            success: true,
            data: {
                cpu: {
                    load: Math.round(cpu.currentLoad),
                    cores: cpu.cpus.length
                },
                memory: {
                    total: mem.total,
                    active: mem.active,
                    free: mem.free,
                    usedPercent: Math.round((mem.active / mem.total) * 100)
                },
                uptime: {
                    seconds: time.uptime,
                    startedAt: new Date(Date.now() - time.uptime * 1000)
                },
                timestamp: new Date()
            }
        });
    } catch (error) {
        logger.error("❌ Failed to fetch system stats", error);
        res.status(500).json({ success: false, message: "Failed to fetch system stats" });
    }
};
