function extractCourseAndLessonId(videoKey: string) {
  // upload/courses/{courseId}/lessons/{lessonId}/video/source.mp4
  const parts = videoKey.split("/");

  const courseIndex = parts.indexOf("courses");
  const lessonIndex = parts.indexOf("lessons");

  if (courseIndex === -1 || lessonIndex === -1) {
    throw new Error("Invalid VIDEO_KEY format");
  }

  return {
    courseId: parts[courseIndex + 1],
    lessonId: parts[lessonIndex + 1],
  };
}


export default extractCourseAndLessonId;