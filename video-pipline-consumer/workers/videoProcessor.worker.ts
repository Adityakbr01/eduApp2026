import { hasActiveVideoTask, runVideoTask } from "../service/ecs.service";
import { deleteMessage, receiveOneMessage } from "../service/sqs.service";


const QUEUE_URL = process.env.SQS_QUEUE_URL!;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function startVideoScheduler() {
  console.log("🎬 Video scheduler started");

  while (true) {
    try {
      // 1️⃣ ECS busy → do NOTHING
      const busy = await hasActiveVideoTask();
      if (busy) {
        console.log("⏳ ECS busy (pending/running). Waiting...");
        await sleep(5000);
        continue;
      }

      // 2️⃣ Receive ONE message
      const res = await receiveOneMessage(QUEUE_URL);
      const msg = res.Messages?.[0];
      if (!msg || !msg.Body || !msg.ReceiptHandle) continue;

      let body: any;
      try {
        body = JSON.parse(msg.Body);
      } catch {
        await deleteMessage(msg.ReceiptHandle);
        continue;
      }

      const key = body?.detail?.object?.key;
      if (!key || !key.endsWith(".mp4")) {
        await deleteMessage(msg.ReceiptHandle);
        continue;
      }

      // 4️⃣ Start ECS (ONLY ONE)
      await runVideoTask({
        key,
        receiptHandle: msg.ReceiptHandle,
      });

      console.log("🚀 ECS task started with all details:", body?.detail?.object?.key);
    } catch (err) {
      console.error("❌ Scheduler error:", err);
      await sleep(3000);
    }
  }
}
