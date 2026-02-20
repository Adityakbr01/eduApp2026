// lib/upload/multipartUpload.ts
import { uploadApi } from "@/services/uploads/api";

const CONCURRENCY = 4;

export interface UploadedPart {
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
  onProgress: (p: number) => void
): Promise<UploadedPart[]> {
  const { intentId, uploadId, partSize, totalParts } = init;

  const queue = Array.from({ length: totalParts }, (_, i) => i + 1);
  let uploadedBytes = 0;
  const completedParts: UploadedPart[] = [];

  async function worker(workerId: number) {
    while (queue.length) {
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
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });

      if (!res.ok) {
        throw new Error(`Part ${partNumber} upload failed`);
      }

      const etag = res.headers.get("ETag");
      if (!etag) {
        throw new Error("ETag missing (check S3 CORS ExposeHeaders)");
      }

      completedParts.push({
        PartNumber: partNumber,
        ETag: etag.replace(/"/g, ""),
      });

      uploadedBytes += blob.size;

      onProgress(
        Math.round((uploadedBytes / file.size) * 100)
      );
    }
  }

  await Promise.all(
    Array.from({ length: CONCURRENCY }).map((_, i) =>
      worker(i + 1)
    )
  );

  return completedParts.sort(
    (a, b) => a.PartNumber - b.PartNumber
  );
}
