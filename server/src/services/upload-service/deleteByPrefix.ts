import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3.js";

export async function deleteByPrefix(prefix) {
    const list = await s3.send(
        new ListObjectsV2Command({
            Bucket: process.env.S3_BUCKET!,
            Prefix: prefix
        })
    );

    if (!list.Contents?.length) return;

    await s3.send(
        new DeleteObjectsCommand({
            Bucket: process.env.S3_BUCKET!,
            Delete: {
                Objects: list.Contents.map(o => ({ Key: o.Key }))
            }
        })
    );
}
