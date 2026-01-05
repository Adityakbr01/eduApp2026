import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3.js";

export async function createMultipart(key, mime) {
    const res = await s3.send(
        new CreateMultipartUploadCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: key,
            ContentType: mime
        })
    );
    return res.UploadId!;
}



import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function signPart(key, uploadId, part) {
    return getSignedUrl(
        s3,
        new UploadPartCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: key,
            UploadId: uploadId,
            PartNumber: part
        }),
        { expiresIn: 300 }
    );
}
