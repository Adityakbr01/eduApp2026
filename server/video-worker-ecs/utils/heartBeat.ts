import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { ddb } from "../workers/videoWorker";
import {
  HEARTBEAT_INTERVAL,
  LOCK_EXTEND_SECONDS,
} from "../workers/videoWorker.js";
import { log } from "./logger.js";


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
