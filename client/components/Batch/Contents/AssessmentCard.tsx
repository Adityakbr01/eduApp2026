"use client";

import {
    CheckCircle,
    ClipboardCheck,
    HelpCircle
} from "lucide-react";

// ========================================================
// ASSESSMENT CARD
// ========================================================
function AssessmentCard({ content }: { content: any }) {
  const isQuiz =
    content.assessmentType === "quiz" || content.contentType === "quiz";
  const Icon = isQuiz ? HelpCircle : ClipboardCheck;
  const label = isQuiz ? "Quiz" : "Assignment";

  return (
    <div className="w-full max-w-lg">
      <div className="bg-dark-card rounded-2xl p-8 border border-white/5 flex flex-col items-center gap-6 shadow-2xl">
        <div
          className={`w-24 h-24 rounded-full grid place-items-center ${isQuiz ? "bg-purple-500/10" : "bg-yellow-500/10"}`}
        >
          <Icon
            className={`w-10 h-10 ${isQuiz ? "text-purple-400" : "text-yellow-400"}`}
          />
        </div>
        <h2 className="text-xl font-semibold text-white">{label}</h2>
        <p className="text-white/50 text-sm text-center">
          {content.marks > 0
            ? `${content.marks} marks available`
            : "No marks assigned"}
        </p>
        {content.isCompleted ? (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            <span>
              Completed — {content.obtainedMarks}/{content.marks}
            </span>
          </div>
        ) : (
          <button
            className="px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            disabled
          >
            Start {label}
          </button>
        )}
      </div>
    </div>
  );
}


export default AssessmentCard;