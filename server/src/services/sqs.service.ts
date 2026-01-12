// import { ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
// import { sqsClient } from "src/configs/aws.js";

// const QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/121635831580/video-processing-queue";

// /**
//  * Receive messages with long polling (Max 1 message)
//  */
// export async function receiveMessages() {
//   try {
//     const command = new ReceiveMessageCommand({
//       QueueUrl: QUEUE_URL,
//       MaxNumberOfMessages: 1,
//       WaitTimeSeconds: 20, // long polling
//     });

//     const response = await sqsClient.send(command);
//     return response.Messages || [];
//   } catch (err) {
//     console.error("❌ Error receiving SQS messages", err);
//     return [];
//   }
// }

// /**
//  * Delete message by ReceiptHandle
//  */
// export async function deleteMessage(receiptHandle: string) {
//   try {
//     const command = new DeleteMessageCommand({
//       QueueUrl: QUEUE_URL,
//       ReceiptHandle: receiptHandle,
//     });

//     await sqsClient.send(command);
//   } catch (err) {
//     console.error("❌ Failed to delete SQS message", err);
//   }
// }
