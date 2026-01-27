export type VideoProfile = {
  name: string;
  width: number;
  bitrate: string;
  maxrate: string;
  bufsize: string;
  level: string;
};

export const VIDEO_PROFILES: VideoProfile[] = [
  {
    name: "360",
    width: 640,
    bitrate: "800k",
    maxrate: "900k",
    bufsize: "1200k",
    level: "3.1",
  },
  {
    name: "720",
    width: 1280,
    bitrate: "2800k",
    maxrate: "3000k",
    bufsize: "4200k",
    level: "4.0",
  },
  // 👉 Add 1080p anytime
  // {
  //   name: "1080",
  //   width: 1920,
  //   bitrate: "5000k",
  //   maxrate: "5500k",
  //   bufsize: "8000k",
  //   level: "4.2",
  // },
];
