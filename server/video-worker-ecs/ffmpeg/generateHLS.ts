import fs from "fs";
import { spawn } from "child_process";
import { buildHlsArgs } from "./hlsBuilder";
import { VIDEO_PROFILES } from "./profiles";
import { hasAudioStream } from "./hasAudio";
import { getVideoDuration } from "./getVideoDuration";
import { log } from "../utils/logger";

export async function generateHLS(
  input: string,
  outDir: string
): Promise<{
  durationSeconds: number;
  durationMs: number;
}> {

  fs.mkdirSync(outDir, { recursive: true });

  // ⏱ Get duration FIRST
  const { seconds, ms } = await getVideoDuration(input);

  const hasAudio = await hasAudioStream(input);

  const args = buildHlsArgs({
    input,
    outDir,
    profiles: VIDEO_PROFILES,
    hasAudio,
    enhancement: "sharp",
  });

  log("INFO", "ffmpeg args", args.join(" "));

  const ffmpeg = spawn("ffmpeg", args);

  ffmpeg.stderr.on("data", d =>
    log("INFO", "ffmpeg", d.toString())
  );

  await new Promise<void>((resolve, reject) => {
    ffmpeg.on("close", code => {
      code === 0
        ? resolve()
        : reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });

  // ✅ return duration for DB
  return {
    durationSeconds: seconds,
    durationMs: ms,
  };
}
