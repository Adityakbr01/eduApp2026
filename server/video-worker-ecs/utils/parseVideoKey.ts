type ParsedVideoKey = {
  courseId: string;
  lessonId: string;
  lessonContentId: string;
  version: string;
};

function parseVideoKey(key: string): ParsedVideoKey {
  const parts = key.split("/");

  const courseIdx = parts.indexOf("courses");
  const lessonIdx = parts.indexOf("lessons");
  const contentIdx = parts.indexOf("lesson-contents");

  if (courseIdx === -1 || lessonIdx === -1 || contentIdx === -1) {
    throw new Error(`❌ Invalid VIDEO_KEY structure: ${key}`);
  }

  const courseId = parts[courseIdx + 1];
  const lessonId = parts[lessonIdx + 1];
  const lessonContentId = parts[contentIdx + 1];

  // source-v1.mp4 → v1
  const fileName = parts[parts.length - 1];
  const match = fileName.match(/source-(v\d+)\./);
  const version = match?.[1] ?? "v1";

  return { courseId, lessonId, lessonContentId, version };
}

export { parseVideoKey, type ParsedVideoKey };