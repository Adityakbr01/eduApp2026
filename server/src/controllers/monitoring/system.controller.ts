import type { Request, Response } from "express";
import si from "systeminformation";
import fs from "fs";

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

        // 👇 Linux se REAL available memory nikaal rahe hain
        const meminfo = fs.readFileSync("/proc/meminfo", "utf8");
        const availableLine = meminfo
            .split("\n")
            .find(line => line.startsWith("MemAvailable"));

        const available =
            parseInt(availableLine!.split(/\s+/)[1], 10) * 1024;

        const used = mem.total - available;
        const usedPercent = Math.round((used / mem.total) * 100);

        res.json({
            success: true,
            data: {
                cpu: {
                    load: Math.round(cpu.currentLoad),
                    cores: cpu.cpus.length
                },
                memory: {
                    total: mem.total,
                    available,
                    used,
                    usedPercent
                },
                uptime: {
                    seconds: time.uptime,
                    startedAt: new Date(Date.now() - time.uptime * 1000)
                },
                timestamp: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

