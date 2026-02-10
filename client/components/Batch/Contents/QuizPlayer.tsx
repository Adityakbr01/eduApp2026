"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  Trophy,
  BarChart3,
  Clock,
  RotateCcw,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentApi } from "@/services/classroom/assessment-api";
import { QUERY_KEYS } from "@/config/query-keys";

interface QuizPlayerProps {
  content: any;
  courseId: string;
}

export default function QuizPlayer({ content, courseId }: QuizPlayerProps) {
  const queryClient = useQueryClient();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation?: string;
    earnedMarks: number;
    penaltyApplied: boolean;
    correctAnswerIndex?: number;
  } | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [runningScore, setRunningScore] = useState(0);

  const quiz = content.assessment?.data;
  const quizId = quiz?._id;

  // Fetch previous attempt
  const { data: attemptData, isLoading: attemptLoading } = useQuery({
    queryKey: ["quiz-attempt", quizId],
    queryFn: () => assessmentApi.getQuizAttempt(quizId),
    enabled: !!quizId,
  });

  const attempt = attemptData?.data;

  const submitMutation = useMutation({
    mutationFn: (data: { questionId: string; selectedOptionIndex: number }) =>
      assessmentApi.submitQuizQuestion(quizId, data),
    onSuccess: (data) => {
      const result = data.data;
      setFeedback({
        isCorrect: result.isCorrect,
        explanation: result.explanation,
        earnedMarks: result.earnedMarks,
        penaltyApplied: result.penaltyApplied,
        correctAnswerIndex: result.correctAnswerIndex,
      });
      setRunningScore(result.totalScore || 0);

      if (result.isQuizCompleted) {
        // Will show summary after clicking "Next"
      }

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CLASSROOM.CONTENT(courseId, content._id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CLASSROOM.BATCH(courseId),
      });
      queryClient.invalidateQueries({
        queryKey: ["quiz-attempt", quizId],
      });
    },
  });

  if (!quiz) {
    return (
      <div className="p-8 text-center text-red-400">Quiz data not found.</div>
    );
  }

  if (attemptLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // ==================== COMPLETED QUIZ RESULTS VIEW ====================
  if (attempt?.attempted && attempt?.isCompleted) {
    const percentage =
      attempt.totalMarks > 0
        ? Math.round((attempt.score / attempt.totalMarks) * 100)
        : 0;
    const passed = attempt.passed;

    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          {/* Score Header */}
          <div
            className={`p-8 text-center ${passed ? "bg-gradient-to-b from-emerald-500/10 to-transparent" : "bg-gradient-to-b from-red-500/10 to-transparent"}`}
          >
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${passed ? "bg-emerald-500/20" : "bg-red-500/20"}`}
            >
              {passed ? (
                <Trophy className="w-10 h-10 text-emerald-400" />
              ) : (
                <XCircle className="w-10 h-10 text-red-400" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {passed ? "Quiz Passed!" : "Quiz Not Passed"}
            </h2>
            <p className="text-white/50 text-sm mb-4">{attempt.quiz.title}</p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p
                  className={`text-4xl font-bold ${passed ? "text-emerald-400" : "text-red-400"}`}
                >
                  {percentage}%
                </p>
                <p className="text-xs text-white/40 mt-1">Score</p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {attempt.score}
                  <span className="text-white/30 text-lg">
                    /{attempt.totalMarks}
                  </span>
                </p>
                <p className="text-xs text-white/40 mt-1">Marks</p>
              </div>
              {attempt.passingMarks > 0 && (
                <>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white/60">
                      {attempt.passingMarks}
                    </p>
                    <p className="text-xs text-white/40 mt-1">Passing</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="p-6 border-t border-white/5">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Question Breakdown
            </h3>
            <div className="space-y-3">
              {attempt.breakdown?.map((q: any, i: number) => (
                <div
                  key={q.questionId}
                  className={`p-4 rounded-xl border ${
                    q.isCorrect
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-red-500/20 bg-red-500/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 mb-1">
                        <span className="text-white/40">Q{i + 1}.</span>{" "}
                        {q.question}
                      </p>
                      <div className="flex items-center gap-3 text-xs">
                        {q.answered && (
                          <span
                            className={
                              q.isCorrect ? "text-emerald-400" : "text-red-400"
                            }
                          >
                            Your answer: {q.options[q.selectedOptionIndex]}
                          </span>
                        )}
                        {!q.isCorrect && q.correctAnswerIndex !== undefined && (
                          <span className="text-emerald-400/70">
                            Correct: {q.options[q.correctAnswerIndex]}
                          </span>
                        )}
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-white/40 mt-2 italic">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-sm font-bold ${q.isCorrect ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {q.earnedMarks}/{q.marks}
                      </span>
                      {q.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          {attempt.completedAt && (
            <div className="px-6 pb-6">
              <div className="flex items-center gap-2 text-xs text-white/30">
                <Clock className="w-3 h-3" />
                Completed on{" "}
                {new Date(attempt.completedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== QUIZ IN PROGRESS / NEW QUIZ ====================

  // If quiz just finished (all questions answered in this session)
  if (quizFinished) {
    const totalMarks = quiz.totalMarks || 0;
    const percentage =
      totalMarks > 0 ? Math.round((runningScore / totalMarks) * 100) : 0;
    const passed = quiz.passingMarks ? runningScore >= quiz.passingMarks : true;

    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-dark-card border border-white/5 rounded-2xl p-8 shadow-2xl text-center">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${passed ? "bg-emerald-500/20" : "bg-red-500/20"}`}
          >
            {passed ? (
              <Trophy className="w-10 h-10 text-emerald-400" />
            ) : (
              <XCircle className="w-10 h-10 text-red-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>
          <p
            className={`text-5xl font-bold mb-2 ${passed ? "text-emerald-400" : "text-red-400"}`}
          >
            {percentage}%
          </p>
          <p className="text-white/50 text-sm mb-6">
            {runningScore} / {totalMarks} marks
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            View Full Results
          </button>
        </div>
      </div>
    );
  }

  // Start from where the student left off (skip already answered questions)
  const answeredQuestionIds = new Set(
    attempt?.breakdown
      ?.filter((q: any) => q.answered)
      .map((q: any) => q.questionId) || [],
  );

  // Find the first unanswered question index
  const firstUnansweredIndex = quiz.questions.findIndex(
    (q: any) => !answeredQuestionIds.has(q._id),
  );

  // If currentQuestionIndex points to an answered question, adjust
  const effectiveIndex =
    currentQuestionIndex < firstUnansweredIndex
      ? firstUnansweredIndex
      : currentQuestionIndex;

  const currentQuestion = quiz.questions[effectiveIndex];
  if (!currentQuestion) {
    setQuizFinished(true);
    return null;
  }

  const handleOptionSelect = (index: number) => {
    if (feedback) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    submitMutation.mutate({
      questionId: currentQuestion._id,
      selectedOptionIndex: selectedOption,
    });
  };

  const handleNext = () => {
    setSelectedOption(null);
    setFeedback(null);
    if (effectiveIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(effectiveIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-dark-card border border-white/5 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 bg-white/5 px-2.5 py-1 rounded-lg">
              {runningScore}/{quiz.totalMarks} marks
            </span>
            <span className="text-sm font-mono text-white/50">
              Q{effectiveIndex + 1}/{quiz.questions.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full mb-8">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{
              width: `${((effectiveIndex + (feedback ? 1 : 0)) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-lg text-white mb-2">
            {currentQuestion.question}
          </h3>
          <p className="text-xs text-white/40">{currentQuestion.marks} marks</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option: string, index: number) => {
            let borderColor = "border-white/10";
            let bgColor = "bg-transparent";

            if (feedback) {
              if (
                index === feedback.correctAnswerIndex &&
                feedback.correctAnswerIndex !== undefined
              ) {
                borderColor = "border-emerald-500/50";
                bgColor = "bg-emerald-500/10";
              } else if (index === selectedOption) {
                borderColor = feedback.isCorrect
                  ? "border-emerald-500/50"
                  : "border-red-500/50";
                bgColor = feedback.isCorrect
                  ? "bg-emerald-500/10"
                  : "bg-red-500/10";
              }
            } else if (selectedOption === index) {
              borderColor = "border-primary";
              bgColor = "bg-primary/5";
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={!!feedback}
                className={`w-full p-4 rounded-xl border ${borderColor} ${bgColor} text-left transition-all hover:bg-white/5 flex items-center justify-between group`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full border border-white/20 grid place-items-center text-xs font-bold text-white/50 shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-white/80 group-hover:text-white transition-colors">
                    {option}
                  </span>
                </div>
                {feedback &&
                  index === selectedOption &&
                  (feedback.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  ))}
              </button>
            );
          })}
        </div>

        {/* Feedback Section */}
        {feedback && (
          <div
            className={`p-4 rounded-xl mb-6 ${
              feedback.isCorrect
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-red-500/10 border border-red-500/20"
            }`}
          >
            <div className="flex items-start gap-3">
              {feedback.isCorrect ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-medium ${
                    feedback.isCorrect ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {feedback.isCorrect ? "Correct!" : "Incorrect"}
                </p>
                {feedback.explanation && (
                  <p className="text-white/60 text-sm mt-1">
                    {feedback.explanation}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-white/40">
                    +{feedback.earnedMarks} marks
                  </span>
                  {feedback.penaltyApplied && (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Late Penalty
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          {feedback ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2 font-medium"
            >
              {effectiveIndex < quiz.questions.length - 1
                ? "Next Question"
                : "View Results"}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null || submitMutation.isPending}
              className="px-6 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Submit Answer"
              )}
            </button>
          )}
        </div>

        {/* Error display */}
        {submitMutation.isError && (
          <p className="text-red-400 text-xs mt-4 text-center">
            {(submitMutation.error as any)?.response?.data?.message ||
              "Failed to submit answer"}
          </p>
        )}
      </div>
    </div>
  );
}
