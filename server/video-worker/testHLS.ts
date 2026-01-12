import path from "path";
import fs from "fs";
import { generateHLS } from "./ffmpeg/generateHLS";

async function main() {
  const input = path.resolve(
    __dirname,
    "test-videos/simple.mp4"   // ✅ CORRECT
  );

  const outDir = path.resolve(
    __dirname,
    "tmp/12345"
  );

  console.log("INPUT PATH:", input);
  console.log("INPUT EXISTS:", fs.existsSync(input));

  if (!fs.existsSync(input)) {
    throw new Error("Input video not found!");
  }

  await generateHLS(input, outDir);

  console.log("✅ HLS generation successful!");
}

main().catch(err => {
  console.error("❌ HLS generation failed", err);
});
