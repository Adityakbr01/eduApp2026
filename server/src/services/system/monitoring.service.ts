import { Log } from "../../models/monitoring/Log.js";
import { MetricAgg } from "../../models/monitoring/MetricAgg.js";
import { MetricRaw } from "../../models/monitoring/MetricRaw.js";

export const MonitoringService = {
    async getMetrics(service: any, range: any) {
        // Default to last 1 hour
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        let query: any = { windowStart: { $gte: oneHourAgo } };
        if (service) query.service = service;

        return await MetricAgg.find(query).sort({ windowStart: 1 });
    },

    async getLogs(query: any) {
        const { service, level, search, page = 1, limit = 50 } = query;
        const skip = (Number(page) - 1) * Number(limit);

        let filter: any = {};
        if (service) filter.service = service;
        if (level) filter.level = level;
        if (search) {
            filter.$or = [
                { message: { $regex: search, $options: "i" } },
                { path: { $regex: search, $options: "i" } }
            ];
        }

        const logs = await Log.find(filter)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Log.countDocuments(filter);

        return {
            data: logs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        };
    },

    async getStats(service: any) {
        // Last 24 hours stats for overview
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        let match: any = { timestamp: { $gte: oneDayAgo } };
        if (service) match.service = service;

        // Aggregate raw metrics for accurate recent stats
        const stats = await MetricRaw.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalRequests: { $sum: 1 },
                    avgLatency: { $avg: "$latencyMs" },
                    errorCount: {
                        $sum: {
                            $cond: [{ $gte: ["$statusCode", 400] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const result = stats[0] || { totalRequests: 0, avgLatency: 0, errorCount: 0 };
        const errorRate = result.totalRequests > 0
            ? (result.errorCount / result.totalRequests) * 100
            : 0;

        return {
            ...result,
            errorRate
        };
    }
};
