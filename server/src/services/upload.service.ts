import {
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BUCKET, s3 } from "src/configs/s3.js";
import { generateIntentId, getPartSize } from "src/utils/upload.utils.js";

export class UploadService {
    static async getPresignedUrl(
        fileName: string,
        size: number,
        type: string,
        key?: string,         // optional custom key
        folder?: string       // optional folder structure
    ) {
        // ------------------- Build Key -------------------
        const baseFolder = folder ?? "uploads";  // default folder
        const uniqueSuffix = key ?? generateIntentId(fileName);

        // Example: videos/course-1/lesson-1-<uuid>.mp4
        const s3Key = `${baseFolder}/${uniqueSuffix}`;

        console.log("Getting presigned URL for:", { fileName, size, type, s3Key });

        // ------------------- SIMPLE UPLOAD (<5MB) -------------------
        if (size < 5 * 1024 * 1024) {
            const command = new PutObjectCommand({
                Bucket: BUCKET,
                Key: s3Key,
                ContentType: type,
            });

            const uploadUrl = await getSignedUrl(s3, command, {
                expiresIn: 300,
            });

            return {
                mode: "simple",
                uploadUrl,
                intentId: s3Key,  // store this key in DB
            };
        }

        // ------------------- MULTIPART -------------------
        return {
            mode: "multipart",
            intentId: s3Key,  // store this key in DB
        };
    }

    static async initMultipart(intentId: string, size: number) {
        const res = await s3.send(
            new CreateMultipartUploadCommand({
                Bucket: BUCKET,
                Key: intentId,
            })
        );

        const partSize = getPartSize(size);

        return {
            uploadId: res.UploadId!,
            partSize,
            totalParts: Math.ceil(size / partSize),
        };
    }

    static async signPart(
        intentId: string,
        uploadId: string,
        partNumber: number
    ) {
        const command = new UploadPartCommand({
            Bucket: BUCKET,
            Key: intentId,
            UploadId: uploadId,
            PartNumber: partNumber,
        });

        return getSignedUrl(s3, command, { expiresIn: 300 });
    }

    static async completeMultipart(
        intentId: string,
        uploadId: string,
        parts: { ETag: string; PartNumber: number }[]
    ) {
        await s3.send(
            new CompleteMultipartUploadCommand({
                Bucket: BUCKET,
                Key: intentId,
                UploadId: uploadId,
                MultipartUpload: { Parts: parts },
            })
        );

        return {
            key: intentId,
        };
    }
}
