import crypto from "crypto";
import { receiveMessages, deleteMessage } from "../service/sqs.service";
import { runVideoTask } from "../service/ecs.service";
import { acquireVideoLock } from "../service/dynamo.service";

const WORKER_ID = "video-scheduler-1";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function startVideoWorker() {
  console.log("🎬 Video scheduler started...");

  while (true) {
    try {
      // 📥 Receive exactly ONE message
      const messages = await receiveMessages();

      if (!messages.length) {
        await sleep(2000); // 💤 prevent tight loop
        continue;
      }

      const msg = messages[0];
      if (!msg.Body || !msg.ReceiptHandle) continue;

      let body: any;
      try {
        body = JSON.parse(msg.Body);
      } catch {
        // invalid message → safe to delete
        await deleteMessage(msg.ReceiptHandle);
        continue;
      }

      const key = body?.detail?.object?.key;
      if (!key || !key.toLowerCase().endsWith(".mp4")) {
        await deleteMessage(msg.ReceiptHandle);
        continue;
      }

      // ✅ FIX 1: UNIQUE videoId (hash of full S3 key)
      const videoId = crypto
        .createHash("sha256")
        .update(key)
        .digest("hex");

      console.log("📥 Video detected:", videoId);

      // 🔐 DYNAMODB LOCK
      const locked = await acquireVideoLock(videoId, WORKER_ID);

      // ✅ FIX 2: DO NOT delete SQS message on lock fail
      if (!locked) {
        console.log("⏭️ Locked, retry later:", videoId);
        continue; // visibility timeout ke baad retry hoga
      }

      // 🚀 START ECS TASK
      await runVideoTask({
        key,
        videoId,
        receiptHandle: msg.ReceiptHandle,
      });

      console.log("🚀 ECS task started:", videoId);

      /**
       * ❌ DO NOT delete SQS message here
       * ECS worker khud delete karega (correct design)
       */

    } catch (err) {
      console.error("❌ Scheduler error:", err);
      await sleep(2000); // safety backoff
    }
  }
}
