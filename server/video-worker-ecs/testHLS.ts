/**
 * Local HLS test runner
 * Run with: npx ts-node testHLS.ts
 */

import path from "path";
import fs from "fs";
import { generateHLS } from "./ffmpeg/generateHLS";

async function testHLS() {
  const input = path.resolve(
    __dirname,
    "test-videos/simple.mp4"
  );

  const outDir = path.resolve(
    __dirname,
    "tmp/hls-test"
  );

  console.log("────────────────────────────────");
  console.log("🎥 Local HLS Test");
  console.log("INPUT:", input);
  console.log("OUTPUT:", outDir);
  console.log("────────────────────────────────");

  if (!fs.existsSync(input)) {
    throw new Error(`❌ Input video not found: ${input}`);
  }

  // Clean old output
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }

  fs.mkdirSync(outDir, { recursive: true });

  const start = Date.now();

  try {
    await generateHLS(input, outDir);

    const time = ((Date.now() - start) / 1000).toFixed(2);

    console.log("────────────────────────────────");
    console.log("✅ HLS generation SUCCESS");
    console.log(`⏱ Time: ${time}s`);
    console.log("📂 Output files:");

    const files = fs.readdirSync(outDir, { recursive: true });
    files.forEach(f => console.log(" -", f));

    console.log("────────────────────────────────");
    console.log("▶️ Play with:");
    console.log(`ffplay ${path.join(outDir, "master.m3u8")}`);
    console.log("────────────────────────────────");

  } catch (err) {
    console.error("────────────────────────────────");
    console.error("❌ HLS generation FAILED");
    console.error(err);
    console.error("────────────────────────────────");
    process.exit(1);
  }
}

testHLS();
