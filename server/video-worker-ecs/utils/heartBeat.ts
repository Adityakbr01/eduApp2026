import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { log } from "./logger.js";

export const ddb = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });

export const HEARTBEAT_INTERVAL = 120; // 2 min
export const LOCK_EXTEND_SECONDS = 15 * 60; // 15 min


let heartbeatTimer: NodeJS.Timeout | null = null;



// 🔥 HEARTBEAT FUNCTIONS
export function startHeartbeat(videoId: string,DYNAMO_TABLE: string) {
  heartbeatTimer = setInterval(async () => {
    const now = Math.floor(Date.now() / 1000);
    const newTTL = now + LOCK_EXTEND_SECONDS;

    try {
      await ddb.send(
        new UpdateItemCommand({
          TableName: DYNAMO_TABLE,
          Key: { videoId: { S: videoId } },
          UpdateExpression:
            "SET lockTTL = :ttl, updatedAt = :now",
          ExpressionAttributeValues: {
            ":ttl": { N: newTTL.toString() },
            ":now": { N: now.toString() },
          },
        })
      );

      log("INFO", "💓 Heartbeat sent", {
        videoId,
        newTTL,
      });
    } catch (err) {
      log("WARN", "⚠️ Heartbeat failed", {
        videoId,
        error: err,
      });
    }
  }, HEARTBEAT_INTERVAL * 1000);
}


// Stop the heartbeat timer
export function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}
