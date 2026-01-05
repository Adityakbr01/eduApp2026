import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { checkUploadRate } from "./rateLimit.js";
import { validateFile } from "./validate.js";
import { buildKey } from "./keyBuilder.js";
import { createIntent } from "./uploadIntent.js";
import { s3 } from "./s3.js";
import { env } from "src/configs/env.js";

const PRESIGN_EXPIRE = 60 * 5; // 5 min
const MULTIPART_THRESHOLD = 10 * 1024 * 1024; // 10MB
export type FileTypeEnum =
    | "profile_image"
    | "course_thumbnail"
    | "lesson_video"
    | "lesson_pdf";


type UploadMode =
    | { mode: "simple"; uploadUrl: string }
    | { mode: "multipart" };


export class UploadService {
    static async getPresignedUrl({
        userId,
        filename,
        fileType,
        fileSize,
        mimeType,
    }: {
        userId: string;
        filename: string;
        fileType: FileTypeEnum;
        fileSize: number;
        mimeType: string;
    }) {
        // 1️⃣ rate limit
        await checkUploadRate(userId);

        // 2️⃣ validate file
        validateFile(fileType, fileSize, mimeType);

        // 3️⃣ extension
        const ext = filename.split(".").pop()!;

        // 4️⃣ build S3 key (TEMP path – two phase commit)
        const key = buildKey({
            scope: "temp",
            userId,
            resource: fileType,
            resourceId: null,
            category: "file",
            ext,
        });

        // 5️⃣ create upload intent (security)
        const intent = await createIntent(userId, key, fileSize, mimeType);

        // 6️⃣ decide upload type
        if (fileSize <= MULTIPART_THRESHOLD) {
            // SIMPLE UPLOAD
            const command = new PutObjectCommand({
                Bucket: env.AWS_S3_BUCKET_NAME!,
                Key: key,
                ContentType: mimeType,
                ContentLength: fileSize, // 🔒 HARD LIMIT
            });

            const url = await getSignedUrl(s3, command, {
                expiresIn: PRESIGN_EXPIRE,
            });

            return {
                mode: "simple" as const,
                intentId: intent.id,
                uploadUrl: url,
                key,
            };
        }

        // MULTIPART upload will be handled by different endpoint
        return {
            mode: "multipart" as const,
            intentId: intent.id,
            key,
        };
    }
}
