import {
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./s3.js";
import { redis } from "src/configs/redis.js";
import { env } from "src/configs/env.js";

const PART_SIZE = 10 * 1024 * 1024; // 10MB per part

export async function createMultipart(key: string, mime: string): Promise<string> {
    const res = await s3.send(
        new CreateMultipartUploadCommand({
            Bucket: env.AWS_S3_BUCKET_NAME!,
            Key: key,
            ContentType: mime
        })
    );
    return res.UploadId!;
}

export function signPart(key: string, uploadId: string, part: number): Promise<string> {
    return getSignedUrl(
        s3,
        new UploadPartCommand({
            Bucket: env.AWS_S3_BUCKET_NAME!,
            Key: key,
            UploadId: uploadId,
            PartNumber: part
        }),
        { expiresIn: 300 }
    );
}

interface UploadPart {
    PartNumber: number;
    ETag: string;
}

export async function completeMultipart(
    key: string,
    uploadId: string,
    parts: UploadPart[]
): Promise<void> {
    await s3.send(
        new CompleteMultipartUploadCommand({
            Bucket: env.AWS_S3_BUCKET_NAME!,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber)
            }
        })
    );
}

export class MultipartUploadService {
    /**
     * Initialize a multipart upload session
     */
    static async initMultipart(userId: string, intentId: string) {
        // Verify intent exists and belongs to user
        const intentData = await redis.get(`upload:intent:${intentId}`);
        if (!intentData) {
            throw new Error("Upload intent not found or expired");
        }

        const intent = JSON.parse(intentData);
        if (intent.userId !== userId) {
            throw new Error("Unauthorized");
        }

        // Create multipart upload
        const uploadId = await createMultipart(intent.key, intent.mime);

        // Calculate parts
        const totalParts = Math.ceil(intent.size / PART_SIZE);

        // Store multipart session info
        await redis.set(
            `upload:multipart:${intentId}`,
            JSON.stringify({ uploadId, key: intent.key, totalParts }),
            "EX",
            3600 // 1 hour
        );

        return {
            uploadId,
            partSize: PART_SIZE,
            totalParts,
        };
    }

    /**
     * Get signed URL for uploading a specific part
     */
    static async signPart(
        userId: string,
        intentId: string,
        uploadId: string,
        partNumber: number
    ): Promise<string> {
        // Verify intent
        const intentData = await redis.get(`upload:intent:${intentId}`);
        if (!intentData) {
            throw new Error("Upload intent not found or expired");
        }

        const intent = JSON.parse(intentData);
        if (intent.userId !== userId) {
            throw new Error("Unauthorized");
        }

        return signPart(intent.key, uploadId, partNumber);
    }

    /**
     * Complete the multipart upload
     */
    static async completeMultipart(
        userId: string,
        intentId: string,
        uploadId: string,
        parts: UploadPart[]
    ) {
        // Verify intent
        const intentData = await redis.get(`upload:intent:${intentId}`);
        if (!intentData) {
            throw new Error("Upload intent not found or expired");
        }

        const intent = JSON.parse(intentData);
        if (intent.userId !== userId) {
            throw new Error("Unauthorized");
        }

        await completeMultipart(intent.key, uploadId, parts);

        // Cleanup multipart session
        await redis.del(`upload:multipart:${intentId}`);

        return { key: intent.key };
    }
}
