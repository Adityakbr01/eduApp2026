export function extractDraftIdFromKey(key: string): string {
  const parts = key.split("/");
  const idx = parts.indexOf("lessoncontents");

  if (idx === -1 || !parts[idx + 1]) {
    throw new Error(`Invalid S3 key, draftId not found: ${key}`);
  }

  return parts[idx + 1];
}
