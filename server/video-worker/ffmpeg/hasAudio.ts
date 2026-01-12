import { spawn } from "child_process";

export function hasAudioStream(input: string): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = spawn("ffprobe", [
      "-v", "error",
      "-select_streams", "a",
      "-show_entries", "stream=index",
      "-of", "csv=p=0",
      input
    ]);

    let output = "";

    probe.stdout.on("data", d => output += d.toString());

    probe.on("close", () => {
      resolve(output.trim().length > 0);
    });
  });
}
