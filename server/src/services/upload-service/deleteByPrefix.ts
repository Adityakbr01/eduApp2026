import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3.js";
import { env } from "src/configs/env.js";

export async function deleteByPrefix(prefix: string): Promise<void> {
    const list = await s3.send(
        new ListObjectsV2Command({
            Bucket: env.AWS_S3_BUCKET_NAME!,
            Prefix: prefix
        })
    );

    if (!list.Contents?.length) return;

    await s3.send(
        new DeleteObjectsCommand({
            Bucket: env.AWS_S3_BUCKET_NAME!,
            Delete: {
                Objects: list.Contents.map(o => ({ Key: o.Key }))
            }
        })
    );
}
