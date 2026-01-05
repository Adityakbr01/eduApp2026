import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3.js";

export async function finalize(tempKey, finalKey) {
    await s3.send(
        new CopyObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            CopySource: `${process.env.S3_BUCKET}/${tempKey}`,
            Key: finalKey
        })
    );

    await s3.send(
        new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: tempKey
        })
    );
}
