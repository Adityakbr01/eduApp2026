import { receiveMessages, deleteMessage } from "../service/sqs.service.js";
import {
  hasRunningVideoTask,
  runVideoTask,
} from "../service/ecs.service.js";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function startVideoWorker() {
  console.log("🎬 Video worker started...");

  while (true) {
    try {
      // 🔒 Concurrency guard (1 video at a time)
      const busy = await hasRunningVideoTask();
      if (busy) {
        await sleep(5000);
        continue;
      }

      // 📥 Poll SQS (long polling already handled)
      const messages = await receiveMessages();
      if (!messages.length) {
        await sleep(2000);
        continue;
      }

      const msg = messages[0];
      if (!msg.Body || !msg.ReceiptHandle) {
        continue;
      }

      let body: any;
      try {
        body = JSON.parse(msg.Body);
      } catch {
        console.warn("⚠️ Invalid JSON (test/junk message), deleting");
        await deleteMessage(msg.ReceiptHandle);
        continue;
      }

      // 🟡 Ignore Amazon test / non-S3 messages
      const key = body?.detail?.object?.key;
      if (!key) {
        console.log("🟡 Test / non-video message detected, skipping");
        await deleteMessage(msg.ReceiptHandle);
        continue;
      }

      // 🔥 Only process original MP4 uploads
      if (!key.toLowerCase().endsWith(".mp4")) {
        console.log("⏭️ Skipping non-mp4 file:", key);
        await deleteMessage(msg.ReceiptHandle);
        continue;
      }

      const videoId = key.split("/").pop()!.replace(".mp4", "");
      console.log("📥 New video detected:", { key, videoId });

      try {
        // 🚀 Trigger ECS task
        await runVideoTask({ key, videoId });

        console.log("✅ ECS task triggered for:", videoId);

        // 🧹 Delete message ONLY after successful RunTask
        await deleteMessage(msg.ReceiptHandle);
      } catch (err) {
        console.error("❌ ECS RunTask failed, will retry:", err);
        // ❗ Do NOT delete → SQS retry / DLQ
      }
    } catch (err) {
      console.error("❌ Worker loop error:", err);
      await sleep(3000);
    }
  }
}
