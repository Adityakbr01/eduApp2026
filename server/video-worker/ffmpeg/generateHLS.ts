import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { log } from "../utils/logger";
import { hasAudioStream } from "./hasAudio";

export async function generateHLS(
  input: string,
  outDir: string
): Promise<void> {

  fs.mkdirSync(outDir, { recursive: true });

  const hasAudio = await hasAudioStream(input);
  log("INFO", "Audio detected", { hasAudio });

  const args: string[] = [
    "-y",
    "-i", input,

    // ================= VIDEO SPLIT + ENHANCEMENT =================
    "-filter_complex",
    "[0:v]split=2[v360][v720];" +
    "[v360]scale=640:360:flags=lanczos,unsharp=5:5:0.8:3:3:0.4,hqdn3d=1.5:1.5:6:6[v360out];" +
    "[v720]scale=1280:720:flags=lanczos,unsharp=5:5:0.8:3:3:0.4,hqdn3d=1.5:1.5:6:6[v720out]",

    // ================= 360p =================
    "-map", "[v360out]",
    ...(hasAudio ? ["-map", "0:a"] : []),
    "-c:v:0", "libx264",
    "-profile:v:0", "main",
    "-level:v:0", "3.1",
    "-pix_fmt", "yuv420p",
    "-b:v:0", "800k",
    "-maxrate:v:0", "900k",
    "-bufsize:v:0", "1200k",
    "-g", "60",
    "-keyint_min", "60",
    "-sc_threshold", "0",

    // ================= 720p =================
    "-map", "[v720out]",
    ...(hasAudio ? ["-map", "0:a"] : []),
    "-c:v:1", "libx264",
    "-profile:v:1", "main",
    "-level:v:1", "4.0",
    "-pix_fmt", "yuv420p",
    "-b:v:1", "2800k",
    "-maxrate:v:1", "3000k",
    "-bufsize:v:1", "4200k",
    "-g", "60",
    "-keyint_min", "60",
    "-sc_threshold", "0",

    // ================= AUDIO (ONCE) =================
    ...(hasAudio
      ? [
          "-c:a", "aac",
          "-b:a", "128k",
          "-ac", "2"
        ]
      : []),

    // ================= HLS =================
    "-f", "hls",
    "-hls_time", "4",
    "-hls_playlist_type", "vod",
    "-hls_flags", "independent_segments",
    "-hls_segment_filename",
    path.join(outDir, "%v", "segment_%03d.ts"),

    "-master_pl_name", "master.m3u8",

    // ================= VARIANT MAP =================
    hasAudio
      ? "-var_stream_map"
      : "-var_stream_map",
    hasAudio
      ? "v:0,a:0,name:360 v:1,a:0,name:720"
      : "v:0,name:360 v:1,name:720",

    path.join(outDir, "%v", "index.m3u8"),
  ];

  const ffmpeg = spawn("ffmpeg", args);

  ffmpeg.stderr.on("data", d => {
    log("INFO", "ffmpeg", d.toString());
  });

  return new Promise((resolve, reject) => {
    ffmpeg.on("close", (code) => {
      if (code === 0) {
        log("INFO", "HLS generation completed successfully");
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });
}
