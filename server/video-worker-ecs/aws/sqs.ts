import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { AwsCredentialIdentity } from "@aws-sdk/types";


export const credentialsLocal: AwsCredentialIdentity = {
  accessKeyId: "AKIARYUQPP4OK5IHUR4H",
  secretAccessKey: "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",
};

export const sqsClient = new SQSClient({
  region: process.env.AWS_REGION! || "us-east-1",
  credentials:credentialsLocal
});

export async function receiveMessages(queueUrl: string) {
  return sqsClient.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 1, WaitTimeSeconds: 20 }));
}

export async function deleteMessage(queueUrl: string, receiptHandle: string) {
  await sqsClient.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: receiptHandle }));
}


