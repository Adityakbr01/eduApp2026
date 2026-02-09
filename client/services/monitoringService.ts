import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1/";


export const getMonitoringStats = async (service?: string) => {
    const response = await axios.get(`${API_URL}monitoring/stats`, {
        params: { service }
    });
    return response.data.data;
};

export const getMonitoringMetrics = async (service?: string, range?: string) => {
    const response = await axios.get(`${API_URL}monitoring/metrics`, {
        params: { service, range }
    });
    return response.data.data;
};

export const getMonitoringLogs = async (params: any) => {
    const response = await axios.get(`${API_URL}monitoring/logs`, {
        params
    });
    return response.data.data;
};

export const getSystemStats = async () => {
    try {
        const response = await axios.get(`${API_URL}monitoring/system`);
        return response.data.data;
    } catch (error) {
        console.warn("Failed to fetch system stats", error);
        return null; // Handle gracefully
    }
};
