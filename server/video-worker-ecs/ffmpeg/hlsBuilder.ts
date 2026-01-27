import path from "path";
import { VideoProfile } from "./profiles";
import { EnhancementPreset, getEnhancementFilter } from "./filters";

type HlsBuilderOptions = {
  input: string;
  outDir: string;
  profiles: VideoProfile[];
  hasAudio: boolean;
  enhancement: EnhancementPreset;
};

export function buildHlsArgs({
  input,
  outDir,
  profiles,
  hasAudio,
  enhancement,
}: HlsBuilderOptions): string[] {

  const filterChains: string[] = [];
  const maps: string[] = [];
  const varMaps: string[] = [];

  profiles.forEach((p, i) => {
    const enhance = getEnhancementFilter(enhancement);
    const vf = [
      `scale=${p.width}:-2:flags=lanczos`,
      enhance
    ].filter(Boolean).join(",");

    filterChains.push(`[0:v]${vf}[v${i}]`);
    maps.push("-map", `[v${i}]`);
    varMaps.push(hasAudio
      ? `v:${i},a:0,name:${p.name}`
      : `v:${i},name:${p.name}`
    );
  });

  const args: string[] = [
    "-y",
    "-i", input,

    "-filter_complex",
    filterChains.join(";"),

    ...maps,
    ...(hasAudio ? ["-map", "0:a:0"] : []),

    "-c:v", "libx264",
    "-profile:v", "main",
    "-pix_fmt", "yuv420p",
    "-g", "60",
    "-keyint_min", "60",
    "-sc_threshold", "0",

    ...profiles.flatMap((p, i) => [
      `-b:v:${i}`, p.bitrate,
      `-maxrate:v:${i}`, p.maxrate,
      `-bufsize:v:${i}`, p.bufsize,
      `-level:v:${i}`, p.level,
    ]),

    ...(hasAudio
      ? ["-c:a", "aac", "-b:a", "128k", "-ac", "2"]
      : []),

    "-f", "hls",
    "-hls_time", "4",
    "-hls_playlist_type", "vod",
    "-hls_flags", "independent_segments",
    "-hls_segment_filename",
    path.join(outDir, "%v", "segment_%03d.ts"),

    "-master_pl_name", "master.m3u8",
    "-var_stream_map", varMaps.join(" "),
    path.join(outDir, "%v", "index.m3u8"),
  ];

  return args;
}
