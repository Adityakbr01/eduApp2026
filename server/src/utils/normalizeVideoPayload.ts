import extractS3Path from "./extractS3Path.js";

function normalizeVideoPayload(video: any) {
  if (!video?.rawKey) return video;

  return {
    rawKey: extractS3Path(video.rawKey),
    hlsKey: null,
    duration: video.duration,
    minWatchPercent: video.minWatchPercent ?? 90,
    status: "UPLOADED",
    isEmailSent: false,
  };
}


export default normalizeVideoPayload;