"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentApi } from "@/services/classroom/assessment-api";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ExternalLink,
  FileText,
  Code,
  Link2,
  Loader2,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SubmissionsViewProps {
  assignmentId: string;
  onBack: () => void;
}

export function SubmissionsView({
  assignmentId,
  onBack,
}: SubmissionsViewProps) {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [gradeInputs, setGradeInputs] = useState<
    Record<string, { marks: string; feedback: string }>
  >({});

  const { data, isLoading } = useQuery({
    queryKey: ["instructor-submissions", assignmentId],
    queryFn: () => assessmentApi.getSubmissions(assignmentId),
  });

  const gradeMutation = useMutation({
    mutationFn: ({
      submissionId,
      marks,
      feedback,
    }: {
      submissionId: string;
      marks: number;
      feedback?: string;
    }) =>
      assessmentApi.gradeSubmission(submissionId, {
        obtainedMarks: marks,
        feedback,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["instructor-submissions", assignmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["instructor-assignments-grading"],
      });
    },
  });

  const gradeAllMutation = useMutation({
    mutationFn: ({ marks, feedback }: { marks: number; feedback?: string }) =>
      assessmentApi.gradeAllSubmissions(assignmentId, {
        marks,
        feedback,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["instructor-submissions", assignmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["instructor-assignments-grading"],
      });
      alert(data.message || "All pending submissions graded successfully");
      setShowGradeAll(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to grade all");
    },
  });

  // Grade All State
  const [showGradeAll, setShowGradeAll] = useState(false);
  const [gradeAllInput, setGradeAllInput] = useState({
    marks: "",
    feedback: "",
  });

  const handleGradeAll = () => {
    if (!gradeAllInput.marks) return;
    if (
      !confirm(
        "Are you sure you want to grade ALL pending submissions with these marks? This cannot be undone.",
      )
    )
      return;

    gradeAllMutation.mutate({
      marks: Number(gradeAllInput.marks),
      feedback: gradeAllInput.feedback || undefined,
    });
  };

  const handleGrade = (submissionId: string) => {
    const input = gradeInputs[submissionId];
    if (!input?.marks) return;
    gradeMutation.mutate({
      submissionId,
      marks: Number(input.marks),
      feedback: input.feedback || undefined,
    });
  };

  const result = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-20 text-red-400 text-sm">
        Failed to load submissions
      </div>
    );
  }

  const { assignment, submissions, totalSubmissions, gradedCount } = result;

  return (
    <div>
      {/* Header with back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to assignments
      </button>

      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">{assignment.title}</h2>
        <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
          <span>{assignment.totalMarks} marks</span>
          <span>·</span>
          <span>
            {gradedCount}/{totalSubmissions} graded
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{
              width: `${
                totalSubmissions > 0
                  ? (gradedCount / totalSubmissions) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Grade All Pending Section */}
      {submissions.some((s: any) => !s.isGraded) && (
        <div className="mb-6 bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Bulk Grading</h3>
              <p className="text-xs text-white/40">
                Grade all {submissions.filter((s: any) => !s.isGraded).length}{" "}
                pending submissions at once.
              </p>
            </div>
            <button
              onClick={() => setShowGradeAll(!showGradeAll)}
              className="text-xs text-primary hover:underline"
            >
              {showGradeAll ? "Cancel" : "Grade All Pending"}
            </button>
          </div>

          {showGradeAll && (
            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-white/25 font-medium mb-1 block">
                  Marks (out of {assignment.totalMarks})
                </label>
                <input
                  type="number"
                  min="0"
                  max={assignment.totalMarks}
                  value={gradeAllInput.marks}
                  onChange={(e) =>
                    setGradeAllInput((prev) => ({
                      ...prev,
                      marks: e.target.value,
                    }))
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/40 placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/25 font-medium mb-1 block">
                  Common Feedback (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={gradeAllInput.feedback}
                    onChange={(e) =>
                      setGradeAllInput((prev) => ({
                        ...prev,
                        feedback: e.target.value,
                      }))
                    }
                    placeholder="Good job! / Needs improvement..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/40 placeholder:text-white/20"
                  />
                  <button
                    onClick={handleGradeAll}
                    disabled={
                      !gradeAllInput.marks || gradeAllMutation.isPending
                    }
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {gradeAllMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">
          No submissions yet
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {submissions.map((sub: any) => {
            const isExpanded = expandedId === sub.id;
            const isGraded = sub.isGraded;
            const input = gradeInputs[sub.id] || {
              marks: "",
              feedback: "",
            };

            return (
              <Collapsible
                key={sub.id}
                open={isExpanded}
                onOpenChange={(open) => setExpandedId(open ? sub.id : null)}
                className="bg-dark-card border border-white/5 rounded-xl overflow-hidden"
              >
                {/* Submission Header */}
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/2 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 grid place-items-center text-xs font-bold text-white/60 uppercase">
                        {sub.student?.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/90">
                          {sub.student?.name || "Unknown"}
                        </p>
                        <p className="text-[10px] text-white/25">
                          {sub.student?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isGraded ? (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          {sub.grade.obtainedMarks}/{assignment.totalMarks}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}

                      {sub.isLate && (
                        <span className="text-[9px] text-red-400 font-semibold px-1.5 py-0.5 bg-red-500/10 rounded">
                          LATE
                        </span>
                      )}

                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-white/25" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-white/25" />
                      )}
                    </div>
                  </button>
                </CollapsibleTrigger>

                {/* Expanded */}
                <CollapsibleContent className="data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
                  <div className="px-4 pb-4 border-t border-white/5">
                    <div className="py-3 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] text-white/30">
                        <span>Type: {sub.submissionType}</span>
                        <span>·</span>
                        <span>
                          {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      {sub.isLate && sub.penalty && (
                        <p className="text-[11px] text-red-400 font-medium">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          Late - {sub.penalty.percent}% penalty
                        </p>
                      )}

                      {/* Content */}
                      <div className="mt-2 p-3 bg-white/2 border border-white/5 rounded-lg">
                        {sub.submissionType === "link" && (
                          <a
                            href={sub.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline break-all"
                          >
                            <Link2 className="w-3.5 h-3.5 shrink-0" />
                            {sub.content}
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        )}
                        {sub.submissionType === "file" && (
                          <a
                            href={sub.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View File
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {sub.submissionType === "text" && (
                          <p className="text-sm text-white/70 whitespace-pre-wrap">
                            {sub.content}
                          </p>
                        )}
                        {sub.submissionType === "code" && (
                          <div>
                            {sub.codeLanguage && (
                              <div className="flex items-center gap-1 mb-1 text-[10px] text-white/25">
                                <Code className="w-3 h-3" />
                                {sub.codeLanguage}
                              </div>
                            )}
                            <pre className="text-sm text-white/70 font-mono whitespace-pre-wrap overflow-x-auto">
                              {sub.content}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Grading */}
                    {isGraded ? (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-sm font-medium text-emerald-400">
                            {sub.grade.obtainedMarks}/{assignment.totalMarks}
                          </span>
                        </div>
                        {sub.grade.feedback && (
                          <p className="text-xs text-white/40 mt-1">
                            {sub.grade.feedback}
                          </p>
                        )}
                        <p className="text-[9px] text-white/15 mt-2">
                          {new Date(sub.grade.gradedAt).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div>
                          <label className="text-[10px] text-white/25 font-medium mb-1 block">
                            Marks (out of {assignment.totalMarks})
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={assignment.totalMarks}
                            value={input.marks}
                            onChange={(e) =>
                              setGradeInputs((prev) => ({
                                ...prev,
                                [sub.id]: {
                                  ...input,
                                  marks: e.target.value,
                                },
                              }))
                            }
                            placeholder="0"
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/40 placeholder:text-white/20"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-white/25 font-medium mb-1 block">
                            Feedback (optional)
                          </label>
                          <textarea
                            rows={2}
                            value={input.feedback}
                            onChange={(e) =>
                              setGradeInputs((prev) => ({
                                ...prev,
                                [sub.id]: {
                                  ...input,
                                  feedback: e.target.value,
                                },
                              }))
                            }
                            placeholder="Write feedback..."
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/40 placeholder:text-white/20 resize-none"
                          />
                        </div>

                        <button
                          onClick={() => handleGrade(sub.id)}
                          disabled={!input.marks || gradeMutation.isPending}
                          className="self-end flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {gradeMutation.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          Save Grade
                        </button>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
}
