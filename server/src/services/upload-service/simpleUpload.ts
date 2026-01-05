import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./s3.js";
import { env } from "src/configs/env.js";


export async function simpleUpload(key, mime) {
    const cmd = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME!,
        Key: key,
    });

    return getSignedUrl(s3, cmd, {
        expiresIn: 300,
    },);
}
