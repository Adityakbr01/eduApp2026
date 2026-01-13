import { receiveMessages, deleteMessage } from "../service/sqs.service";
import { runVideoTask } from "../service/ecs.service";
import { acquireVideoLock } from "../service/dynamo.service";

const WORKER_ID = "video-scheduler-1";

export async function startVideoWorker() {
  console.log("🎬 Video worker started...");

  while (true) {
    try {
      // 📥 Receive exactly ONE message
      const messages = await receiveMessages();
      if (!messages.length) continue;

      const msg = messages[0];
      if (!msg.Body || !msg.ReceiptHandle) continue;

      let body: any;
      try {
        body = JSON.parse(msg.Body);
      } catch {
        await deleteMessage(msg.ReceiptHandle);
        continue;
      }

      const key = body?.detail?.object?.key;
      if (!key || !key.toLowerCase().endsWith(".mp4")) {
        await deleteMessage(msg.ReceiptHandle);
        continue;
      }

      const videoId = key.split("/").pop()!.replace(".mp4", "");
      console.log("📥 Video detected:", videoId);

      // 🔐 DYNAMODB LOCK
      const locked = await acquireVideoLock(videoId, WORKER_ID);

      if (!locked) {
        console.log("⏭️ Already processing, skipping:", videoId);
        await deleteMessage(msg.ReceiptHandle);
        continue;
      }

      // 🚀 START ECS TASK
      await runVideoTask({ key, videoId, receiptHandle: msg.ReceiptHandle });
      console.log("🚀 ECS task started:", videoId);

      /**
       * ❌ DO NOT delete SQS message here
       * ECS task ke end me delete hoga
       */

    } catch (err) {
      console.error("❌ Worker error:", err);
    }
  }
}
