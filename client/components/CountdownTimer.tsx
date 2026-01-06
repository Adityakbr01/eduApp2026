// lib/upload/multipartUpload.ts
import { uploadApi } from "@/services/uploads/api";

const CONCURRENCY = 4;

interface UploadedPart {
    PartNumber: number;
    ETag: string;
}

export async function multipartUpload(
    file: File,
    init: {
        intentId: string;
        uploadId: string;
        partSize: number;
        totalParts: number;
    },
    isPaused: () => boolean,
    onProgress: (p: number) => void
): Promise<void> {
    const { intentId, uploadId, partSize, totalParts } = init;

    const storageKey = `upload:${intentId}`;
    const uploaded: number[] = JSON.parse(
        localStorage.getItem(storageKey) || "[]"
    );

    const parts: UploadedPart[] = [];
    const queue: number[] = [];
    let uploadedBytes = 0;

    for (let i = 1; i <= totalParts; i++) {
        if (!uploaded.includes(i)) {
            queue.push(i);
        } else {
            uploadedBytes += Math.min(
                partSize,
                file.size - (i - 1) * partSize
            );
        }
    }

    async function worker() {
        while (queue.length) {
            if (isPaused()) return;

            const partNumber = queue.shift();
            if (!partNumber) return;

            const start = (partNumber - 1) * partSize;
            const end = Math.min(start + partSize, file.size);
            const blob = file.slice(start, end);

            const url = await uploadApi.signPart(
                intentId,
                uploadId,
                partNumber
            );

            const res = await fetch(url, {
                method: "PUT",
                body: blob,
                headers: { "Content-Type": file.type },
            });

            if (!res.ok) throw new Error("Part upload failed");

            const etag = res.headers.get("ETag");
            if (!etag) throw new Error("ETag missing");

            parts.push({ PartNumber: partNumber, ETag: etag });
            uploaded.push(partNumber);
            uploadedBytes += blob.size;

            localStorage.setItem(storageKey, JSON.stringify(uploaded));

            onProgress(Math.round((uploadedBytes * 100) / file.size));
        }
    }

    await Promise.all(
        Array(CONCURRENCY).fill(0).map(worker)
    );

    await uploadApi.completeMultipart(intentId, uploadId, parts);
    localStorage.removeItem(storageKey);
}
