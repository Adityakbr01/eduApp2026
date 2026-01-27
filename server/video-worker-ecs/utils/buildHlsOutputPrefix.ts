function buildHlsOutputPrefix(params: {
  courseId: string;
  lessonId: string;
  lessonContentId: string;
  version: string;
}) {
  return `prod/public/courses/${params.courseId}` +
         `/lessons/${params.lessonId}` +
         `/lesson-contents/${params.lessonContentId}` +
         `/hls/${params.version}`;
}
export { buildHlsOutputPrefix };