import { ECSClient } from "@aws-sdk/client-ecs";
import { SQSClient } from "@aws-sdk/client-sqs";

export const AWS_REGION = "us-east-1"
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!

if(!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY){
  throw new Error("AWS credentials are missing");
}



export const sqsClient = new SQSClient({
  region: AWS_REGION,
  credentials:{
    accessKeyId:AWS_ACCESS_KEY_ID,
    secretAccessKey:AWS_SECRET_ACCESS_KEY,
  }
});

export const ecsClient = new ECSClient({
  region: AWS_REGION,
   credentials:{
    accessKeyId:AWS_ACCESS_KEY_ID,
    secretAccessKey:AWS_SECRET_ACCESS_KEY,
  }
});
