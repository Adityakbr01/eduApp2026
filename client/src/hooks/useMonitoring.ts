import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
    getMonitoringStats,
    getMonitoringMetrics,
    getMonitoringLogs,
    getSystemStats,
} from "../services/monitoringService";
import { socketUrl } from "@/constants/SOCKET_IO";

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

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        try {
            console.log("[MONITORING] Fetching REST data...", {
                page,
                searchQuery,
            });

            const [statsData, metricsData, logsData, systemData] =
                await Promise.all([
                    getMonitoringStats(),
                    getMonitoringMetrics(),
                    getMonitoringLogs({ page, search: searchQuery, limit: 20 }),
                    getSystemStats(),
                ]);

            setStats(statsData);
            setMetrics(metricsData);
            setSystemStats(systemData);
            setLogs(logsData.data);
            setTotalPages(logsData.pagination.pages);

        } catch (error) {
            console.error("[MONITORING] REST fetch failed", error);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [page, searchQuery]);

    useEffect(() => {
        fetchData(true);



        console.log("[SOCKET] Initializing socket", {
            socketUrl,
            path: "/socket.io",
            transports: ["websocket", "polling"],
        });

        const socket: Socket = io(socketUrl, {
            path: "/socket.io",
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true,
        });

        socket.on("connect", () => {
            console.log("[SOCKET] ✅ Connected", {
                id: socket.id,
                transport: socket.io.engine.transport.name,
            });
            setIsLive(true);

            // Listen for transport upgrade on the engine (available after connect)
            socket.io.engine.on("upgrade", (transport) => {
                console.log("[SOCKET] 🔄 Transport upgraded", transport.name);
            });
        });

        socket.io.on("error", (err) => {
            console.error("[SOCKET] ❌ Engine error", err);
        });

        socket.on("connect_error", (err: any) => {
            console.error("[SOCKET] ❌ Connect error", {
                message: err.message,
                name: err.name,
                description: err.description,
                context: err.context,
                socketUrl,
            });
            setIsLive(false);
        });

        socket.on("disconnect", (reason) => {
            console.warn("[SOCKET] 🔌 Disconnected", reason);
            setIsLive(false);
        });

        socket.on("reconnect_attempt", (attempt) => {
            console.log(`[SOCKET] 🔁 Reconnect attempt ${attempt}`);
        });

        socket.on("reconnect_failed", () => {
            console.error("[SOCKET] 💥 Reconnect failed");
        });

        socket.onAny((event, ...args) => {
            console.log(`[SOCKET] 📡 Event received: ${event}`, args);
        });

        socket.on("new-log", (newLog: any) => {
            console.log("[SOCKET] 🆕 new-log received", newLog);

            setStats((prev) => {
                const total = prev.totalRequests + 1;
                const isError = newLog.statusCode >= 400;
                const errorCount = prev.errorCount + (isError ? 1 : 0);
                const errorRate = (errorCount / total) * 100;
                const avgLatency =
                    prev.avgLatency +
                    (newLog.latencyMs - prev.avgLatency) / total;

                return {
                    totalRequests: total,
                    errorCount,
                    errorRate,
                    avgLatency,
                };
            });

            if (page === 1 && !searchQuery) {
                setLogs((prev) => {
                    const updated = [newLog, ...prev];
                    if (updated.length > 50) updated.pop();
                    return updated;
                });
            }
        });

        const interval = setInterval(() => {
            console.log("[MONITORING] Periodic refresh");
            fetchData(false);
        }, 30000);

        return () => {
            console.log("[SOCKET] Cleanup: disconnecting socket");
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
        refresh: () => fetchData(false),
    };
};
