import { spawn } from "child_process";

export function getVideoDuration(
  input: string
): Promise<{ seconds: number; ms: number }> {
  return new Promise((resolve, reject) => {
    const probe = spawn("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      input,
    ]);

    let output = "";

    probe.stdout.on("data", d => {
      output += d.toString();
    });

    probe.on("close", code => {
      if (code !== 0 || !output.trim()) {
        return reject(new Error("Failed to read video duration"));
      }

      const seconds = parseFloat(output.trim());

      if (Number.isNaN(seconds)) {
        return reject(new Error("Invalid duration value"));
      }

      resolve({
        seconds,
        ms: Math.round(seconds * 1000),
      });
    });
  });
}
