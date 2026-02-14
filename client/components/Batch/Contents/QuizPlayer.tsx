"use client";

import { QuizData } from "@/services/classroom/batch-types";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { quizApi } from "@/services/assessments/api"; // Assuming cn is available, otherwise replace with classNames logic

interface QuizPlayerProps {
  contentId: string;
  courseId: string;
  quizData: QuizData;
  isCompleted: boolean;
  obtainedMarks: number;
}

export default function QuizPlayer({
  contentId,
  courseId,
  quizData,
  isCompleted: initialisCompleted,
  obtainedMarks: initialObtainedMarks,
}: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, number>
  >({});
  const [showResults, setShowResults] = useState(initialisCompleted);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [obtainedMarks, setObtainedMarks] = useState(initialObtainedMarks);
  const [completed, setCompleted] = useState(initialisCompleted);

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

  const handleOptionSelect = (optionIndex: number) => {
    if (showResults) return;
    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestion._id]: optionIndex,
    }));
  };

  const submitCurrentQuestion = async () => {
    const selectedOption = selectedOptions[currentQuestion._id];
    if (selectedOption === undefined) return true; // Skip if no option selected (or handle validation)

    try {
      setIsSubmitting(true);
      await quizApi.submitQuestion(quizData._id, {
        questionId: currentQuestion._id,
        selectedOptionIndex: selectedOption,
      });
      return true;
    } catch (error) {
      console.error("Failed to submit answer:", error);
      // toast.error("Failed to save answer");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    const success = await submitCurrentQuestion();
    if (!success) return;

    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Final submit
      try {
        setIsSubmitting(true);
        // Fetch final results
        const attempt = await quizApi.getAttempt(quizData._id);
        if (attempt && attempt.data) {
          setObtainedMarks(attempt.data.obtainedMarks);
        }
        setShowResults(true);
        setCompleted(true);
      } catch (error) {
        console.error("Failed to fetch results:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#171717] text-white p-6 rounded-xl border border-white/10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold">{quizData.title}</h2>
          {quizData.description && (
            <p className="text-sm text-white/50">{quizData.description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/70">
            Question {currentQuestionIndex + 1} / {quizData.questions.length}
          </span>
          {completed && (
            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full">
              Completed ({obtainedMarks}/{quizData.totalMarks})
            </span>
          )}
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col gap-6">
        <h3 className="text-lg font-medium leading-relaxed">
          {currentQuestionIndex + 1}. {currentQuestion.question}
        </h3>

        <div className="flex flex-col gap-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOptions[currentQuestion._id] === index;
            // Basic visual logic for selected state
            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={showResults || isSubmitting}
                className={cn(
                  "p-4 rounded-lg border text-left transition-all",
                  isSelected
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white/70",
                  (showResults || isSubmitting) &&
                    "cursor-not-allowed opacity-80",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-white/30",
                    )}
                  >
                    {isSelected && (
                      <CheckCircle className="w-3 h-3 text-black" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between mt-8 pt-4 border-t border-white/10">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || isSubmitting}
          className="px-6 py-2 rounded-lg bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className={cn(
            "px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2",
            isLastQuestion
              ? "bg-primary hover:bg-primary/90 text-black"
              : "bg-white/10 hover:bg-white/20 text-white",
            isSubmitting && "opacity-50 cursor-not-allowed",
          )}
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
          {isLastQuestion
            ? showResults
              ? "Submitted"
              : "Submit Quiz"
            : "Next"}
        </button>
      </div>
    </div>
  );
}
