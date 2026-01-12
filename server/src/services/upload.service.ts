import {
    CompleteMultipartUploadCommand,
    CreateMultipartUploadCommand,
    PutObjectCommand,
    UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "src/configs/env.js";
import { s3 } from "src/configs/s3.js";
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
        console.log("🚀 Generated S3 Key:", s3Key);
        // ------------------- SIMPLE UPLOAD (<5MB) -------------------
        if (size < 5 * 1024 * 1024) {
            const command = new PutObjectCommand({
                Bucket: env.AWS_S3_BUCKET_NAME,
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

        console.log("🚀 Using multipart upload for file:", fileName);
        console.log("🚀 S3 Key:", s3Key);

        // ------------------- MULTIPART -------------------
        return {
            mode: "multipart",
            intentId: s3Key,  // store this key in DB
        };
    }

    static async initMultipart(intentId: string, size: number) {
        const res = await s3.send(
            new CreateMultipartUploadCommand({
                Bucket: env.AWS_S3_BUCKET_NAME,
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
            Bucket: env.AWS_S3_BUCKET_NAME,
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
                Bucket: env.AWS_S3_BUCKET_NAME,
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
