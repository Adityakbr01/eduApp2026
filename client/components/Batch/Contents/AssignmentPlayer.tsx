"use client";

import { useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Link2,
  Code,
  Type,
  Clock,
  Award,
  Send,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentApi } from "@/services/classroom/assessment-api";
import { QUERY_KEYS } from "@/config/query-keys";

interface AssignmentPlayerProps {
  content: any;
  courseId: string;
}

const submissionTypeConfig = {
  file: {
    icon: FileText,
    label: "File URL",
    placeholder: "https://drive.google.com/...",
  },
  link: { icon: Link2, label: "Link", placeholder: "https://github.com/..." },
  text: {
    icon: Type,
    label: "Text",
    placeholder: "Write your response here...",
  },
  code: { icon: Code, label: "Code", placeholder: "Paste your code here..." },
};

export default function AssignmentPlayer({
  content,
  courseId,
}: AssignmentPlayerProps) {
  const queryClient = useQueryClient();
  const [submissionValue, setSubmissionValue] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [activeSubmissionType, setActiveSubmissionType] = useState<
    "file" | "text" | "link" | "code"
  >("link");

  const assignmentId = content.assessment?.data?._id;
  const assignmentData = content.assessment?.data;

  // Fetch existing submission
  const { data: submissionData, isLoading: submissionLoading } = useQuery({
    queryKey: ["assignment-submission", assignmentId],
    queryFn: () => assessmentApi.getAssignmentSubmission(assignmentId),
    enabled: !!assignmentId,
  });

  const submission = submissionData?.data;

  const submitMutation = useMutation({
    mutationFn: (data: any) =>
      assessmentApi.submitAssignment(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CLASSROOM.CONTENT(courseId, content._id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CLASSROOM.BATCH(courseId),
      });
      queryClient.invalidateQueries({
        queryKey: ["assignment-submission", assignmentId],
      });
    },
  });

  const handleSubmit = () => {
    if (!submissionValue.trim()) return;

    const payload: any = { submissionType: activeSubmissionType };

    if (activeSubmissionType === "file") payload.fileUrl = submissionValue;
    else if (activeSubmissionType === "link") payload.linkUrl = submissionValue;
    else if (activeSubmissionType === "text")
      payload.textContent = submissionValue;
    else if (activeSubmissionType === "code") {
      payload.codeContent = submissionValue;
      payload.codeLanguage = codeLanguage;
    }

    submitMutation.mutate(payload);
  };

  // Deadline status
  const isLate =
    content.deadline?.dueDate &&
    new Date() > new Date(content.deadline.dueDate);
  const penaltyPercent = content.deadline?.penaltyPercent || 0;

  if (submissionLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Determine allowed submission types from assignment config
  const allowedType = assignmentData?.submission?.type || "file";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {assignmentData?.title || content.title}
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2.5 py-0.5 rounded-lg bg-yellow-400/10 text-yellow-400 text-xs font-medium">
                  Assignment
                </span>
                <span className="text-white/40">•</span>
                <span className="text-white/60">
                  {assignmentData?.totalMarks || content.marks} Marks
                </span>
              </div>
            </div>
            {isLate && !submission?.submitted && (
              <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full text-xs font-medium border border-amber-500/20">
                <AlertCircle className="w-3 h-3" />
                Overdue (-{penaltyPercent}%)
              </div>
            )}
          </div>

          {/* Deadline info */}
          {content.deadline?.dueDate && (
            <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
              <Clock className="w-3.5 h-3.5" />
              Due:{" "}
              {new Date(content.deadline.dueDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </div>
          )}
        </div>

        {/* Description */}
        {(assignmentData?.description || content.description) && (
          <div className="px-6 pb-4">
            <div className="bg-white/5 rounded-xl p-5 text-white/80 text-sm leading-relaxed">
              {assignmentData?.description || content.description}
            </div>
          </div>
        )}

        {/* Instructions */}
        {assignmentData?.instructions &&
          assignmentData.instructions.length > 0 && (
            <div className="px-6 pb-4">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                Instructions
              </h3>
              <div className="bg-white/5 rounded-xl p-5 space-y-2">
                {assignmentData.instructions.map(
                  (instruction: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold grid place-items-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-white/70">{instruction}</p>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

        {/* Submission Area */}
        <div className="p-6 border-t border-white/5">
          {submission?.submitted ? (
            /* ==================== ALREADY SUBMITTED ==================== */
            <div className="space-y-4">
              <div className="flex flex-col items-center py-6 text-center bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Assignment Submitted
                </h3>
                <p className="text-white/40 text-xs">
                  Submitted on{" "}
                  {new Date(submission.submittedAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    },
                  )}
                </p>
              </div>

              {/* Submission details */}
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Type</span>
                  <span className="text-xs text-white/70 capitalize">
                    {submission.submissionType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Content</span>
                  <span className="text-xs text-white/70 truncate max-w-[200px]">
                    {submission.content}
                  </span>
                </div>
                {submission.isLate && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">Status</span>
                    <span className="text-xs text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Late (-{submission.penalty?.percent || 0}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Grade */}
              {submission.isGraded ? (
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5 text-center">
                  <Award className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">
                    {submission.grade.obtainedMarks}
                    <span className="text-white/30 text-sm">
                      /{assignmentData?.totalMarks || content.marks}
                    </span>
                  </p>
                  <p className="text-xs text-white/40 mt-1">Grade</p>
                  {submission.grade.feedback && (
                    <p className="text-sm text-white/60 mt-3 italic">
                      &ldquo;{submission.grade.feedback}&rdquo;
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-5 text-center">
                  <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-amber-400">
                    Awaiting Grade
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    Your instructor will grade this soon.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* ==================== SUBMISSION FORM ==================== */
            <div className="space-y-4">
              {/* Submission type tabs (if config allows switching) */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">
                  Submit your work
                </label>

                {/* Type selector */}
                <div className="flex gap-2 mb-4">
                  {(["link", "file", "text", "code"] as const).map((type) => {
                    const config = submissionTypeConfig[type];
                    const Icon = config.icon;
                    const isActive = activeSubmissionType === type;

                    return (
                      <button
                        key={type}
                        onClick={() => {
                          setActiveSubmissionType(type);
                          setSubmissionValue("");
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/30"
                            : "bg-white/5 text-white/40 border border-white/10 hover:text-white/70"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>

                {/* Input area */}
                {activeSubmissionType === "text" ||
                activeSubmissionType === "code" ? (
                  <div>
                    {activeSubmissionType === "code" && (
                      <select
                        value={codeLanguage}
                        onChange={(e) => setCodeLanguage(e.target.value)}
                        className="mb-2 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="typescript">TypeScript</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                      </select>
                    )}
                    <textarea
                      rows={8}
                      placeholder={
                        submissionTypeConfig[activeSubmissionType].placeholder
                      }
                      className={`w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors resize-none ${
                        activeSubmissionType === "code"
                          ? "font-mono text-xs"
                          : ""
                      }`}
                      value={submissionValue}
                      onChange={(e) => setSubmissionValue(e.target.value)}
                    />
                  </div>
                ) : (
                  <input
                    type="url"
                    placeholder={
                      submissionTypeConfig[activeSubmissionType].placeholder
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                    value={submissionValue}
                    onChange={(e) => setSubmissionValue(e.target.value)}
                  />
                )}
              </div>

              {/* Late warning */}
              {isLate && (
                <p className="text-xs text-amber-500/70 text-center flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Late submissions receive a {penaltyPercent}% penalty.
                </p>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!submissionValue.trim() || submitMutation.isPending}
                className="w-full bg-primary text-black font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Assignment
                  </>
                )}
              </button>

              {/* Error display */}
              {submitMutation.isError && (
                <p className="text-red-400 text-xs text-center">
                  {(submitMutation.error as any)?.response?.data?.message ||
                    "Failed to submit assignment"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
