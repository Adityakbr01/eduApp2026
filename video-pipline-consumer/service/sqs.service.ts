import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { sqsClient } from "../config/aws";

const QUEUE_URL = process.env.SQS_QUEUE_URL!;
if (!QUEUE_URL) throw new Error("❌ SQS_QUEUE_URL missing");

export async function receiveMessages() {
  const command = new ReceiveMessageCommand({
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 1, // 🔒 ONE MESSAGE ONLY
    WaitTimeSeconds: 20,
    VisibilityTimeout: 7200, // 2 hours (FFmpeg safe)
  });

  const response = await sqsClient.send(command);
  return response.Messages ?? [];
}

export async function deleteMessage(receiptHandle: string) {
  const command = new DeleteMessageCommand({
    QueueUrl: QUEUE_URL,
    ReceiptHandle: receiptHandle,
  });

  await sqsClient.send(command);
}


export async function receiveOneMessage(queueUrl: string) {
  return sqsClient.send(
    new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 10, // long polling
    })
  );
}
