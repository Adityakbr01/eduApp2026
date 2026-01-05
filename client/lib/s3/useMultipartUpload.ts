import { uploadApi } from "@/services/uploads/api";

const CONCURRENCY = 4;

export interface MultipartInit {
    intentId: string;
    key: string;
    uploadId?: string;
    totalParts?: number;
    partSize?: number;
}

interface UploadedPart {
    PartNumber: number;
    ETag: string;
}

/**
 * Handles multipart upload for large files with resumable support
 */
export async function multipartUpload(
    file: File,
    init: MultipartInit,
    onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void
): Promise<void> {
    // Get multipart upload details from backend
    const multipartInfo = await uploadApi.initMultipart(init.intentId);

    const { uploadId, partSize, totalParts } = multipartInfo;

    // Track uploaded parts in localStorage for resumability
    const storageKey = `upload:${init.intentId}`;
    const uploaded: number[] = JSON.parse(
        localStorage.getItem(storageKey) || "[]"
    );

    const parts: UploadedPart[] = [];
    const queue: number[] = [];
    let uploadedBytes = 0;

    // Build queue of parts that need to be uploaded
    for (let i = 1; i <= totalParts; i++) {
        if (!uploaded.includes(i)) {
            queue.push(i);
        } else {
            // Already uploaded, add to parts list
            uploadedBytes += Math.min(partSize, file.size - (i - 1) * partSize);
        }
    }

    async function worker(): Promise<void> {
        while (queue.length > 0) {
            const partNumber = queue.shift();
            if (partNumber === undefined) break;

            const start = (partNumber - 1) * partSize;
            const end = Math.min(start + partSize, file.size);
            const blob = file.slice(start, end);

            // Get signed URL for this part
            const url = await uploadApi.signPart(init.intentId, uploadId, partNumber);

            // Upload the part
            const res = await fetch(url, {
                method: "PUT",
                body: blob,
                headers: {
                    "Content-Type": file.type,
                },
            });

            if (!res.ok) {
                throw new Error(`Failed to upload part ${partNumber}`);
            }

            const etag = res.headers.get("ETag");
            if (etag) {
                parts.push({ PartNumber: partNumber, ETag: etag });
            }

            // Track progress
            uploaded.push(partNumber);
            uploadedBytes += blob.size;
            localStorage.setItem(storageKey, JSON.stringify(uploaded));

            if (onProgress) {
                onProgress({
                    loaded: uploadedBytes,
                    total: file.size,
                    percentage: Math.round((uploadedBytes * 100) / file.size),
                });
            }
        }
    }

    // Run workers in parallel
    await Promise.all(Array(CONCURRENCY).fill(0).map(worker));

    // Complete the multipart upload
    await uploadApi.completeMultipart(init.intentId, uploadId, parts);

    // Cleanup localStorage
    localStorage.removeItem(storageKey);
}
