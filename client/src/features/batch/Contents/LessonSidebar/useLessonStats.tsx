import { LessonDetailResponse } from "@/services/classroom/batch-types";
import { useMemo } from "react";

// ─── Stats Calculator ───
function useLessonStats(lesson: LessonDetailResponse | undefined) {
  return useMemo(() => {
    if (!lesson?.contents) return null;
    const contents = lesson.contents;
    const total = contents.length;

    const videos = contents.filter((c) => c.type === "video");
    const completedVideos = videos.filter((c) => c.isCompleted).length;
    const problems = contents.filter((c) => c.type === "assignment");
    const completedProblems = problems.filter((c) => c.isCompleted).length;
    const quizzes = contents.filter((c) => c.type === "quiz");
    const completedQuizzes = quizzes.filter((c) => c.isCompleted).length;

    const totalMarks = contents.reduce((a, c) => a + (c.marks || 0), 0);
    const obtainedMarks = contents.reduce(
      (a, c) => a + (c.obtainedMarks || 0),
      0,
    );
    const completionPercentage =
      totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

    return {
      completionPercentage,
      videos: { done: completedVideos, total: videos.length },
      problems: { done: completedProblems, total: problems.length },
      quizzes: { done: completedQuizzes, total: quizzes.length },
      score: { obtained: obtainedMarks, total: totalMarks },
    };
  }, [lesson]);
}

export default useLessonStats;
