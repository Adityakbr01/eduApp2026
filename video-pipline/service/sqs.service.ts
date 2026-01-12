import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { sqsClient } from "../config/aws.js";

const QUEUE_URL = process.env.SQS_QUEUE_URL!;
if (!QUEUE_URL) throw new Error("❌ SQS_QUEUE_URL missing");

/**
 * Receive messages with long polling (Max 1 message)
 */
export async function receiveMessages() {
  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 20,
    });

    const response = await sqsClient.send(command);
    return response.Messages || [];
  } catch (err) {
    console.error("❌ Error receiving SQS messages", err);
    return [];
  }
}

export async function deleteMessage(receiptHandle: string) {
  try {
    const command = new DeleteMessageCommand({
      QueueUrl: QUEUE_URL,
      ReceiptHandle: receiptHandle,
    });

    await sqsClient.send(command);
  } catch (err) {
    console.error("❌ Failed to delete SQS message", err);
  }
}
