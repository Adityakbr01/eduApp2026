import axios, { type AxiosInstance } from "axios";
import { env } from "src/configs/env.js";
import logger from "src/utils/logger.js";

const VDO_BASE = "https://dev.vdocipher.com/api";

interface VdoUploadResponse {
    videoId: string;
    clientPayload: {
        uploadLink: string;
        policy: string;
        key: string;
        "x-amz-algorithm": string;
        "x-amz-credential": string;
        "x-amz-date": string;
        "x-amz-signature": string;
    };
}

// ✅ Dedicated Axios Instance (Scalable)
const vdoClient: AxiosInstance = axios.create({
    baseURL: VDO_BASE,
    timeout: 1200000, // 20 minutes
    headers: {
        Authorization: `Apisecret ${env.VDO_CIPHER_API_KEY}`,
        Accept: "application/json",
    },
});

// Response interceptor for logging
vdoClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log(error);
        logger.error("❌ VdoCipher API Error", {
            status: error.response?.status,
            data: error.response?.data,
        });
        return Promise.reject(error);
    }
);

// ✅ Retry Helper (Exponential Backoff)
const retryRequest = async <T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        logger.warn(`⚠️ Retrying Vdo request... attempts left: ${retries}`);
        await new Promise((res) => setTimeout(res, delay));
        return retryRequest(fn, retries - 1, delay * 2);
    }
};

export const createVdoVideo = async (
    title: string
): Promise<VdoUploadResponse> => {
    const query = new URLSearchParams({ title }).toString();

    logger.info("📡 Creating VdoCipher video", {
        title,
        endpoint: `/videos?${query}`,
    });

    return retryRequest(async () => {
        const response = await vdoClient.put<VdoUploadResponse>(
            `/videos?${query}`,
            {} // Empty body as per current VdoCipher API
        );

        logger.info("✅ VdoCipher video created", {
            videoId: response.data.videoId,
        });

        return response.data;
    });
};