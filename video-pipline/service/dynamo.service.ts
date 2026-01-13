import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

const ddb = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

const TABLE_NAME = "video-processing-jobs";

export async function acquireVideoLock(
  videoId: string,
  workerId: string
) {
  const now = Math.floor(Date.now() / 1000);
  const ttl = now + 60 * 60; // 1 hour

  try {
    await ddb.send(
      new PutItemCommand({
        TableName: TABLE_NAME,
        Item: {
          videoId: { S: videoId },
          status: { S: "PROCESSING" },
          lockedBy: { S: workerId },
          lockTTL: { N: ttl.toString() },
          updatedAt: { N: now.toString() },
        },
        ConditionExpression:
          "attribute_not_exists(videoId) OR lockTTL < :now",
        ExpressionAttributeValues: {
          ":now": { N: now.toString() },
        },
      })
    );
    return true; // 🔒 lock acquired
  } catch {
    return false; // ❌ already locked
  }
}

export async function markJobFailed(videoId: string) {
  await ddb.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: { videoId: { S: videoId } },
      UpdateExpression: "SET #s = :f",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: { ":f": { S: "FAILED" } },
    })
  );
}
