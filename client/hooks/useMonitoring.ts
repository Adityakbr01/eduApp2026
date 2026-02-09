import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import {
    getMonitoringStats,
    getMonitoringMetrics,
    getMonitoringLogs,
    getSystemStats,
} from "../services/monitoringService";

export const useMonitoring = () => {
    const [stats, setStats] = useState({
        totalRequests: 0,
        avgLatency: 0,
        errorCount: 0,
        errorRate: 0,
    });
    const [systemStats, setSystemStats] = useState<any>(null);
    const [metrics, setMetrics] = useState([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);

    // Pagination & Search state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        try {
            const [statsData, metricsData, logsData, systemData] = await Promise.all([
                getMonitoringStats(),
                getMonitoringMetrics(),
                getMonitoringLogs({ page, search: searchQuery, limit: 20 }),
                getSystemStats(),
            ]);

            console.log(statsData, metricsData, logsData);

            setStats(statsData);
            setMetrics(metricsData);
            setSystemStats(systemData);

            // If live mode is active, we might not want to overwrite logs with paginated data
            // unless the user is explicitly paginating or searching.
            // For simplicity in this hybrid mode:
            // - If user is on page 1 and no search is active, we append live logs.
            // - If user is paginating, we show static historical data (live logs still arrive but maybe don't jump the view).

            if (isInitial || (page === 1 && !searchQuery)) {
                setLogs(logsData.data);
            } else {
                setLogs(logsData.data); // Just show what we fetched for that page
            }

            setTotalPages(logsData.pagination.pages);

        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [page, searchQuery]);

    useEffect(() => {
        fetchData(true);

        // Determine socket URL - remove /api/v1 suffix if present
        const apiUrl = (process.env.NODE_ENV==="production" ? "https://app.edulaunch.shop" : "http://localhost:3001");
        const socketUrl = apiUrl.replace(/\/api\/v1\/?$/, "");

        const socket = io(socketUrl, {
            path: "/socket.io/",
            reconnectionAttempts: 5,
            transports: ["websocket", "polling"], // Try websocket first
        });

        socket.on("connect", () => {
            console.log("Monitoring Socket connected to:", socketUrl);
            setIsLive(true);
        });

        socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
            setIsLive(false);
        });

        socket.on("disconnect", () => {
            setIsLive(false);
        });

        socket.on("new-log", (newLog: any) => {
            // Update Stats locally for real-time feel
            setStats((prevStats) => {
                const newTotal = prevStats.totalRequests + 1;
                const isError = newLog.statusCode >= 400;
                const newErrorCount = prevStats.errorCount + (isError ? 1 : 0);
                const newErrorRate = (newErrorCount / newTotal) * 100;

                // Approximate moving average for latency
                // New Avg = Old Avg + (New Value - Old Avg) / New Total
                const newAvgLatency = prevStats.avgLatency + (newLog.latencyMs - prevStats.avgLatency) / newTotal;

                return {
                    totalRequests: newTotal,
                    errorCount: newErrorCount,
                    errorRate: newErrorRate,
                    avgLatency: newAvgLatency
                };
            });

            // Only prepend live logs if we are on the first page and not searching
            if (page === 1 && !searchQuery) {
                setLogs((prev) => {
                    const updated = [newLog, ...prev];
                    if (updated.length > 50) updated.pop();
                    return updated;
                });
            }
        });

        const interval = setInterval(() => fetchData(false), 30000);

        return () => {
            socket.disconnect();
            clearInterval(interval);
        };
    }, [fetchData, page, searchQuery]);

    return {
        stats,
        metrics,
        logs,
        systemStats,
        loading,
        isLive,
        page,
        setPage,
        totalPages,
        searchQuery,
        setSearchQuery,
        refresh: () => fetchData(false)
    };
};
