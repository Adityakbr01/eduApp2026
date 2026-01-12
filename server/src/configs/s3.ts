import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.js";

export const s3 = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
});

// export const BUCKET = env.AWS_S3_BUCKET_NAME;
export const TEMP_BUCKET = "eduapp-video-temp";
export const PROD_BUCKET = "eduapp-video-prod";
export const VIDEO_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/121635831580/video-processing-queue"


// VIDEO_QUEUE_URL : https://sqs.us-east-1.amazonaws.com/121635831580/video-processing-queue
// sqs eventName :  lesson-video-upload-event
// Acconut ID: 121635831580
//ECR Repository: 121635831580.dkr.ecr.us-east-1.amazonaws.com/video-processing-worker
//task arn : arn:aws:ecs:us-east-1:121635831580:task-definition/video-worker-eduaApp-Task:1