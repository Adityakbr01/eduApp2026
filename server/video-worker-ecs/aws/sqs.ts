import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { AWS_REGION,AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY } from "../workers/videoWorker";

import { AwsCredentialIdentity } from "@aws-sdk/types";
const credentials: AwsCredentialIdentity = {
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
};

export const sqsClient = new SQSClient({
  region: AWS_REGION,
  credentials,
});

export async function receiveMessages(queueUrl: string) {
  return sqsClient.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 1, WaitTimeSeconds: 20 }));
}

export async function deleteMessage(queueUrl: string, receiptHandle: string) {
  await sqsClient.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: receiptHandle }));
}


