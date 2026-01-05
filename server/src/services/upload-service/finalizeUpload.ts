import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3.js";
import { redis } from "src/configs/redis.js";
import { buildKey } from "./keyBuilder.js";
import { env } from "src/configs/env.js";

export async function finalize(tempKey: string, finalKey: string, mimeType: string): Promise<void> {
    await s3.send(
        new CopyObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME!,
            CopySource: `${env.AWS_S3_BUCKET_NAME}/${tempKey}`,
            Key: finalKey,
            MetadataDirective: "REPLACE",
        })
    );

    await s3.send(
        new DeleteObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME!,
            Key: tempKey
        })
    );
}

export class FinalizeUploadService {
    /**
     * Finalize upload - move from temp to permanent storage
     */
    static async finalizeUpload(userId: string, intentId: string) {
        // Get and verify intent
        const intentData = await redis.get(`upload:intent:${intentId}`);
        if (!intentData) {
            throw new Error("Upload intent not found or expired");
        }

        const intent = JSON.parse(intentData);
        if (intent.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const tempKey = intent.key;

        // Extract file type and extension from temp key
        const keyParts = tempKey.split("/");
        const filename = keyParts[keyParts.length - 1];
        const ext = filename.split(".").pop();
        const resource = keyParts[3]; // prod/temp/userId/resource/...

        // Build final key (permanent storage)
        const finalKey = buildKey({
            scope: "uploads",
            userId,
            resource,
            resourceId: null,
            category: "file",
            ext,
        });

        // Move file from temp to final location
        await finalize(tempKey, finalKey, intent.mimeType);

        // Cleanup intent
        await redis.del(`upload:intent:${intentId}`);

        // Build public URL
        const url = `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${finalKey}`;

        return {
            finalKey,
            url,
        };
    }
}
