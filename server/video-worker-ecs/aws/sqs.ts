import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { AWS_REGION, credentialsLocal } from "../workers/videoWorker";


export const sqsClient = new SQSClient({
  region: AWS_REGION,
  credentials:credentialsLocal
});

export async function receiveMessages(queueUrl: string) {
  return sqsClient.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 1, WaitTimeSeconds: 20 }));
}

export async function deleteMessage(queueUrl: string, receiptHandle: string) {
  await sqsClient.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: receiptHandle }));
}


