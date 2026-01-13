// import crypto from "crypto";
// import { receiveMessages, deleteMessage } from "../service/sqs.service";
// import { runVideoTask } from "../service/ecs.service";
// import { acquireVideoLock } from "../service/dynamo.service";

// const WORKER_ID = "video-scheduler-1";

// const sleep = (ms: number) =>
//   new Promise((resolve) => setTimeout(resolve, ms));

// export async function startVideoWorker() {
//   console.log("🎬 Video scheduler started...");

//   while (true) {
//     try {
//       // 📥 Receive exactly ONE message
//       const messages = await receiveMessages();

//       if (!messages.length) {
//         await sleep(2000); // 💤 prevent tight loop
//         continue;
//       }

//       const msg = messages[0];
//       if (!msg.Body || !msg.ReceiptHandle) continue;

//       let body: any;
//       try {
//         body = JSON.parse(msg.Body);
//       } catch {
//         // invalid message → safe to delete
//         await deleteMessage(msg.ReceiptHandle);
//         continue;
//       }

//       const key = body?.detail?.object?.key;
//       if (!key || !key.toLowerCase().endsWith(".mp4")) {
//         await deleteMessage(msg.ReceiptHandle);
//         continue;
//       }

//       // ✅ FIX 1: UNIQUE videoId (hash of full S3 key)
//       const videoId = crypto
//         .createHash("sha256")
//         .update(key)
//         .digest("hex");

//       console.log("📥 Video detected:", videoId);

//       // 🔐 DYNAMODB LOCK
//       const locked = await acquireVideoLock(videoId, WORKER_ID);

//       // ✅ FIX 2: DO NOT delete SQS message on lock fail
//       if (!locked) {
//         console.log("⏭️ Locked, retry later:", videoId);
//         continue; // visibility timeout ke baad retry hoga
//       }

//       // 🚀 START ECS TASK
//       await runVideoTask({
//         key,
//         videoId,
//         receiptHandle: msg.ReceiptHandle,
//       });

//       console.log("🚀 ECS task started:", videoId);

//       /**
//        * ❌ DO NOT delete SQS message here
//        * ECS worker khud delete karega (correct design)
//        */

//     } catch (err) {
//       console.error("❌ Scheduler error:", err);
//       await sleep(2000); // safety backoff
//     }
//   }
// }



import crypto from "crypto";
import { receiveOneMessage, deleteMessage } from "../service/sqs.service";
import { runVideoTask, hasActiveVideoTask } from "../service/ecs.service";

const QUEUE_URL = process.env.SQS_QUEUE_URL!;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function startVideoScheduler() {
  console.log("🎬 Video scheduler started");

  while (true) {
    try {
      // 1️⃣ Check ECS state FIRST
      const ecsBusy = await hasActiveVideoTask();
      if (ecsBusy) {
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
        await deleteMessage( msg.ReceiptHandle);
        continue;
      }

      const key = body?.detail?.object?.key;
      if (!key || !key.endsWith(".mp4")) {
        await deleteMessage(msg.ReceiptHandle);
        continue;
      }

      // 3️⃣ Unique job identity (NOT filename)
      const videoId = crypto
        .createHash("sha256")
        .update(key)
        .digest("hex");

      console.log("📥 Scheduling video:", videoId);

      // 4️⃣ Start ECS task (ONE ONLY)
      await runVideoTask({
        key,
        videoId,
        receiptHandle: msg.ReceiptHandle,
      });

      console.log("🚀 ECS task started:", videoId);

      // ❗ DO NOT delete SQS message here
      // Worker will delete on success/failure

    } catch (err: any) {
      console.error("❌ Scheduler error:", err);
      await sleep(3000);
    }
  }
}
