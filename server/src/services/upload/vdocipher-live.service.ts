import axios, { type AxiosInstance } from "axios";
import { env } from "src/configs/env.js";
import logger from "src/utils/logger.js";

// ✅ All live stream API calls → www.vdocipher.com/api/livestream
// ✅ All recorded video API calls → dev.vdocipher.com/api
const VDO_LIVE_BASE = "https://www.vdocipher.com/api";
const VDO_VIDEO_BASE = "https://dev.vdocipher.com/api";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface VdoLiveStream {
    streamId: string;
    title: string;
    // "Preparing" | "Ready to Start Broadcasting" | "Streaming Active" | "Disconnected" | "Closed"
    status: string;
    createdAt: number;
    chatMode?: "off" | "anonymous" | "authenticated";
    chatType?: "off" | "anonymous" | "authenticated";
    chatSecret?: string;       // only present for authenticated chat
    server?: string;           // RTMP ingest URL  e.g. rtmp://....:1935/livestream
    serverKey?: string;        // RTMP stream key
    streamDuration?: number;
    viewerCount?: number;
    playbackUrl?: { hls: string };
    roomArn?: string;
}

export interface CreateLiveStreamOptions {
    title: string;
    chatType?: "off" | "anonymous" | "authenticated";
    allowedDomains?: string;   // "domain1.com,domain2.com"
    scheduledAt?: number;      // epoch ms
    folderId?: string;
    tagCsv?: string;
}

// ── Axios clients ─────────────────────────────────────────────────────────────

const makeClient = (baseURL: string): AxiosInstance => {
    const c = axios.create({
        baseURL,
        timeout: 30000,
        headers: {
            Authorization: `Apisecret ${env.VDO_CIPHER_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

    c.interceptors.response.use(
        (res) => res,
        (err) => {
            logger.error(`❌ VdoCipher API Error [${baseURL}]`, {
                status: err.response?.status,
                data: JSON.stringify(err.response?.data),
                url: err.config?.url,
            });
            return Promise.reject(err);
        }
    );

    return c;
};

// For live stream management
const liveClient = makeClient(VDO_LIVE_BASE);

// For recorded video OTP (used by regular video playback — NOT live streams)
const videoClient = makeClient(VDO_VIDEO_BASE);

// ── Retry ─────────────────────────────────────────────────────────────────────

const retry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    try {
        return await fn();
    } catch (err) {
        if (retries <= 0) throw err;
        logger.warn(`⚠️ Retrying VdoCipher request... (${retries} left)`);
        await new Promise((r) => setTimeout(r, delay));
        return retry(fn, retries - 1, delay * 2);
    }
};

// ── Live Stream API ───────────────────────────────────────────────────────────

/**
 * Create a live stream.
 * POST https://www.vdocipher.com/api/livestream
 *
 * Response includes streamId, server (RTMP URL), serverKey (stream key),
 * and chatSecret (if chatType === "authenticated").
 */
export const createLiveStream = async (options: CreateLiveStreamOptions): Promise<VdoLiveStream> => {
    const { title, chatType = "off", allowedDomains, scheduledAt, folderId, tagCsv } = options;

    logger.info("📡 Creating VdoCipher Live Stream", { title, chatType });

    const body: Record<string, any> = { title, chatType };
    if (allowedDomains) body.allowedDomains = allowedDomains;
    if (scheduledAt) body.scheduledAt = scheduledAt;
    if (folderId) body.folderId = folderId;
    if (tagCsv) body.tagCsv = tagCsv;

    return retry(async () => {
        const res = await liveClient.post<VdoLiveStream>("/livestream", body);
        logger.info("✅ VdoCipher Live Stream created", { streamId: res.data.streamId });
        return res.data;
    });
};

/**
 * List all live streams.
 * GET https://www.vdocipher.com/api/livestream/
 */
export const listLiveStreams = async (): Promise<VdoLiveStream[]> => {
    return retry(async () => {
        const res = await liveClient.get<{ liveStreams: VdoLiveStream[] }>("/livestream/");
        return res.data.liveStreams ?? [];
    });
};

/**
 * Get live stream private details (includes RTMP credentials).
 * GET https://www.vdocipher.com/api/livestream/{streamId}
 */
export const getLiveStream = async (streamId: string): Promise<VdoLiveStream> => {
    return retry(async () => {
        const res = await liveClient.get<VdoLiveStream>(`/livestream/${streamId}`);
        return res.data;
    });
};

/**
 * Get live stream public details (no credentials).
 * GET https://www.vdocipher.com/api/livestream/details/{streamId}
 */
export const getLiveStreamPublic = async (streamId: string): Promise<VdoLiveStream> => {
    return retry(async () => {
        const res = await liveClient.get<VdoLiveStream>(`/livestream/details/${streamId}`);
        return res.data;
    });
};

/**
 * End a live stream.
 * PATCH https://www.vdocipher.com/api/livestream/{streamId}/end
 */
export const endLiveStream = async (streamId: string): Promise<void> => {
    logger.info("📡 Ending VdoCipher Live Stream", { streamId });
    return retry(async () => {
        await liveClient.patch(`/livestream/${streamId}/end`);
        logger.info("✅ VdoCipher Live Stream ended", { streamId });
    });
};

// ── Recorded Video OTP (for VOD — NOT live streams) ──────────────────────────

/**
 * Get OTP for a RECORDED video (VOD only).
 *
 * ❌ Do NOT call this for live streams.
 *    Live streams use https://player.vdocipher.com/live-v2?liveId=<ID>
 *    with no OTP — just liveId + optional chat JWT token.
 */
export const getVideoOTP = async (videoId: string, email: string): Promise<any> => {
    logger.info("📡 Generating VOD OTP", { videoId });

    return retry(async () => {
        const watermark = [
            { type: "rtext", text: email || "EduLaunch", alpha: "0.45", x: "10", y: "10", color: "0xFFFFFF", size: "8", interval: "5000" },
        ];

        const res = await videoClient.post(`/videos/${videoId}/otp`, {
            ttl: 300,
            annotate: JSON.stringify(watermark),
        });

        logger.info("✅ VOD OTP generated", { videoId });
        return res.data;
    });
};

// ── Embed URL helpers ─────────────────────────────────────────────────────────

/**
 * Build the correct VdoCipher live player URL.
 *
 * Official format (from docs):
 *   https://player.vdocipher.com/live-v2?liveId=<STREAM_ID>&token=<JWT>
 *
 * token is optional — only needed for authenticated chat mode.
 */
export const buildPlayerUrl = (streamId: string, chatToken?: string | null): string => {
    const base = `https://player.vdocipher.com/live-v2?liveId=${streamId}`;
    return chatToken ? `${base}&token=${chatToken}` : base;
};

/**
 * Build the correct Zenstream chat URL.
 *
 * Official format (from docs):
 *   https://zenstream.chat?liveId=<STREAM_ID>&token=<JWT>   (authenticated)
 *   https://zenstream.chat?liveId=<STREAM_ID>               (anonymous)
 */
export const buildChatUrl = (streamId: string, chatToken?: string | null): string => {
    const base = `https://zenstream.chat?liveId=${streamId}`;
    return chatToken ? `${base}&token=${chatToken}` : base;
};