export type UploadMode = "simple" | "multipart";

export interface PresignResponse {
    mode: UploadMode;
    uploadUrl?: string;
    intentId: string;
}

export interface MultipartInitResponse {
    uploadId: string;
    partSize: number;
    totalParts: number;
}
