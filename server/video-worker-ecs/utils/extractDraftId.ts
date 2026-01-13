export default function extractDraftId(videoKey: string): string {
  // upload/courses/.../lessons/.../lessoncontents/{draftId}/video/source.mp4
  const parts = videoKey.split("/");

  const idx = parts.indexOf("lessoncontents");
  if (idx === -1 || !parts[idx + 1]) {
    throw new Error("Invalid VIDEO_KEY, lessoncontents not found");
  }

  return parts[idx + 1]; // 🔥 THIS IS draftId
}
