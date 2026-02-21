"use client";

import { cn } from "@/lib/utils";
import { QuizData } from "@/services/classroom/batch-types";
import { assessmentApi } from "@/services/classroom/assessment-api";
import {
  useSubmitQuizFinal,
  useSubmitQuizQuestion,
} from "@/services/classroom/mutations";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface QuizPlayerProps {
  contentId: string;
  courseId: string;
  quizData: QuizData;
  quizState: {
    currentIndex: number;
    completed: boolean;
    obtainedMarks: number;
  };
  setQuizState: React.Dispatch<
    React.SetStateAction<{
      currentIndex: number;
      completed: boolean;
      obtainedMarks: number;
    }>
  >;
}

export default function QuizPlayer({
  contentId,
  courseId,
  quizData,
  quizState,
  setQuizState,
}: QuizPlayerProps) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, number>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: submitQuestion } = useSubmitQuizQuestion(quizData._id);
  const { mutateAsync: submitFinal, isPending: isFinalSubmitting } =
    useSubmitQuizFinal(courseId, contentId);

  const currentQuestionIndex = quizState.currentIndex;
  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  const showResults = quizState.completed;

  // ─── Fetch historical answers when quiz is already completed ───
  useEffect(() => {
    if (!showResults) return;
    // Only fetch if selectedOptions is empty (i.e. page was loaded with quiz already completed)
    if (Object.keys(selectedOptions).length > 0) return;

    const fetchAttempt = async () => {
      try {
        const res = await assessmentApi.getQuizAttempt(quizData._id);
        const attempt = res.data;
        if (attempt?.attempted && attempt.breakdown) {
          const opts: Record<string, number> = {};
          attempt.breakdown.forEach((item: any) => {
            if (
              item.questionId &&
              item.selectedOptionIndex !== null &&
              item.selectedOptionIndex !== undefined
            ) {
              opts[item.questionId] = item.selectedOptionIndex;
            }
          });
          setSelectedOptions(opts);
        }
      } catch (err) {
        console.error("Failed to fetch quiz attempt:", err);
      }
    };

    fetchAttempt();
  }, [showResults, quizData._id]);

  const handleOptionSelect = (optionIndex: number) => {
    if (showResults) return;
    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestion._id]: optionIndex,
    }));
  };

  const submitCurrentQuestion = async () => {
    const selectedOption = selectedOptions[currentQuestion._id];
    if (selectedOption === undefined) return true;

    try {
      setIsSubmitting(true);
      await submitQuestion({
        questionId: currentQuestion._id,
        selectedOptionIndex: selectedOption,
      });
      return true;
    } catch (error) {
      console.error("Failed to submit answer:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    const success = await submitCurrentQuestion();
    if (!success) return;

    if (!isLastQuestion) {
      setQuizState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }));
    } else {
      try {
        setIsSubmitting(true);
        const attempt = await submitFinal(quizData._id);
        if (attempt && attempt.data) {
          // Populate selectedOptions from the breakdown for review
          if (attempt.data.breakdown) {
            const opts: Record<string, number> = { ...selectedOptions };
            attempt.data.breakdown.forEach((item: any) => {
              if (
                item.questionId &&
                item.selectedOptionIndex !== null &&
                item.selectedOptionIndex !== undefined
              ) {
                opts[item.questionId] = item.selectedOptionIndex;
              }
            });
            setSelectedOptions(opts);
          }
          setQuizState((prev) => ({
            ...prev,
            obtainedMarks:
              attempt.data.score ?? attempt.data.obtainedMarks ?? 0,
            completed: true,
          }));
        } else {
          setQuizState((prev) => ({ ...prev, completed: true }));
        }
      } catch (error) {
        console.error("Failed to fetch results:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setQuizState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
      }));
    }
  };

  return (
    <div className="h-full w-full relative overflow-hidden">
      <div className="h-full bg-dark-card rounded-2xl border border-white/5 flex flex-col text-white/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center w-full shadow-md shadow-black/5 h-16 shrink-0 px-6 text-xl bg-dark-extra-light">
          <div className="flex gap-4 md:gap-6 overflow-x-auto items-center tracking-wide w-full">
            <div className="text-base md:text-lg flex gap-2 items-start shrink-0">
              <span className="font-semibold">Options:</span>
              <span className="text-white/40 line-clamp-1">
                Choose the correct option
              </span>
            </div>
            <div className="ms-auto flex items-center gap-4 md:gap-6">
              <button className="btn btn-sm md:btn-md rounded-lg bg-doubt text-base md:text-lg font-apfel btn-neutral border-0 text-white font-normal px-4 py-1.5">
                Doubt
              </button>
              <div className="text-sm md:text-base text-shadow-red-200 shrink-0">
                <span>Attempts: </span>
                <span className="font-medium text-white/90">
                  {quizData.questions.length > 0 ? 1 : 0}/
                  {quizData.maxAttempts || 1}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 md:px-8 py-6 h-full overflow-y-auto flex flex-col justify-between">
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOptions[currentQuestion._id] === index;

              const isCorrect =
                showResults && currentQuestion.correctAnswerIndex === index;

              const isWrongSelected =
                showResults &&
                isSelected &&
                currentQuestion.correctAnswerIndex !== index;

              const baseWrapper =
                "option-enter w-full border p-4 md:p-5 rounded-xl text-lg md:text-xl font-helvetica relative cursor-pointer flex items-center gap-4 transition-all duration-200 group";

              const baseRadio =
                "w-5 h-5 md:w-6 md:h-6 shrink-0 transition-all duration-200 border-2 ring-0";

              // 🎨 Wrapper Styles
              const wrapperStyle = showResults
                ? isCorrect
                  ? "border-green-500 bg-green-500/10 text-green-400"
                  : isWrongSelected
                    ? "border-red-500 bg-red-500/10 text-red-400"
                    : "border-white/5 text-dark-light/40 opacity-70"
                : isSelected
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-white/5 text-dark-light/80 hover:bg-white/[0.03] hover:border-white/10";

              // 🎯 Radio Styles
              const radioStyle = showResults
                ? isCorrect
                  ? "border-green-500 text-green-500"
                  : isWrongSelected
                    ? "border-red-500 text-red-500"
                    : "border-dark-light/40"
                : isSelected
                  ? "border-primary text-primary"
                  : "border-dark-light/40 group-hover:border-dark-light/60";

              return (
                <label
                  key={index}
                  style={{ animationDelay: `${index * 80}ms` }}
                  className={cn(
                    baseWrapper,
                    wrapperStyle,
                    !showResults && "hover:scale-[1.01] active:scale-[0.99]",
                  )}
                >
                  <input
                    type="radio"
                    name={`mcq-${currentQuestion._id}`}
                    checked={isSelected}
                    onChange={() => handleOptionSelect(index)}
                    disabled={showResults || isSubmitting}
                    className={cn(baseRadio, radioStyle)}
                  />

                  <span className="leading-snug pt-0.5 flex-1">{option}</span>

                  {/* ✅ Result Indicator */}
                  {showResults && isCorrect && (
                    <span className="text-green-400 text-sm font-semibold">
                      ✓ Correct
                    </span>
                  )}

                  {showResults && isWrongSelected && (
                    <span className="text-red-400 text-sm font-semibold">
                      ✕ Wrong
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {showResults && currentQuestion.explanation && (
            <div className="mt-8 text-2xl font-apfel-mittel transition-all duration-300">
              <div
                className={cn(
                  "flex items-baseline",
                  selectedOptions[currentQuestion._id] ===
                    currentQuestion.correctAnswerIndex
                    ? "text-green"
                    : "text-red-500",
                )}
                style={{
                  transformOrigin: "left center",
                  transition: "transform 320ms",
                }}
              >
                <span className="text-[1.6rem] align-middle">
                  {selectedOptions[currentQuestion._id] ===
                  currentQuestion.correctAnswerIndex
                    ? "🎉"
                    : "😥"}
                </span>
                <span className="ml-1">
                  {selectedOptions[currentQuestion._id] ===
                  currentQuestion.correctAnswerIndex
                    ? "Correct answer!"
                    : "Wrong answer :("}
                </span>
              </div>
              <div className="bg-dark-light/10 mt-6 p-4 rounded-xl transition-opacity duration-300">
                <div className="text-white/80">Explanation:</div>
                <div className="text-yellow-50 font-apfel font-normal text-lg mt-2">
                  {currentQuestion.explanation}
                </div>
                <div className="flex flex-wrap"></div>
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors flex items-center gap-2 group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Previous
            </button>

            {showResults ? (
              // Review mode: allow navigating forward through questions
              <button
                onClick={() => {
                  if (!isLastQuestion) {
                    setQuizState((prev) => ({
                      ...prev,
                      currentIndex: prev.currentIndex + 1,
                    }));
                  }
                }}
                disabled={isLastQuestion}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 active:scale-95",
                  isLastQuestion
                    ? "opacity-30 cursor-not-allowed bg-white/5 border border-white/10 text-white/50"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/10",
                )}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              // Active quiz mode: submit or go next
              <button
                onClick={handleNext}
                disabled={
                  isSubmitting ||
                  selectedOptions[currentQuestion._id] === undefined
                }
                className={cn(
                  "px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 active:scale-95 disabled:active:scale-100",
                  isLastQuestion
                    ? "bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/10",
                  (isSubmitting ||
                    selectedOptions[currentQuestion._id] === undefined) &&
                    "opacity-50 cursor-not-allowed grayscale",
                )}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isLastQuestion ? (
                  "Submit Quiz"
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
