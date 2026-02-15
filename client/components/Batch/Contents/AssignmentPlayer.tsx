"use client";

import { AssignmentData } from "@/services/classroom/batch-types";
import { useState, useRef } from "react";
import { useSubmitAssignment } from "@/services/classroom/mutations";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignmentPlayerProps {
  contentId: string;
  courseId: string;
  assignmentData: AssignmentData;
  isCompleted: boolean;
  obtainedMarks: number;
}

export default function AssignmentPlayer({
  contentId,
  courseId,
  assignmentData,
  isCompleted: initialIsCompleted,
  obtainedMarks: initialObtainedMarks,
}: AssignmentPlayerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [obtainedMarks, setObtainedMarks] = useState(initialObtainedMarks);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: submitAssignment } = useSubmitAssignment(
    courseId,
    contentId,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    if (!file) return;

    try {
      setIsSubmitting(true);
      // const formData = new FormData();
      // formData.append("file", file);

      // await assignmentApi.submit(assignmentData._id, formData);

      // FAKE SUBMISSION FOR DEV
      const payload = {
        submissionType: "link",
        linkUrl:
          "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      };
      await submitAssignment({
        assignmentId: assignmentData._id,
        data: payload,
      });

      setIsCompleted(true);
      // Optional: fetch updated details if needed, but for now we settle for success state
      setFile(null);
    } catch (error) {
      console.error("Failed to submit assignment:", error);
      // toast.error("Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#171717] text-white p-6 rounded-xl border border-white/10 gap-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{assignmentData.title}</h2>
          <p className="text-white/60">{assignmentData.description}</p>
        </div>
        {isCompleted && (
          <span className="px-4 py-1.5 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-500/30">
            {obtainedMarks > 0
              ? `Graded: ${obtainedMarks}/${assignmentData.totalMarks}`
              : "Submitted"}
          </span>
        )}
      </div>

      {/* Content Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Instructions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {assignmentData.instructions &&
            assignmentData.instructions.length > 0 && (
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" x2="8" y1="13" y2="13" />
                    <line x1="16" x2="8" y1="17" y2="17" />
                    <line x1="10" x2="8" y1="9" y2="9" />
                  </svg>
                  Instructions
                </h3>
                <ul className="space-y-3">
                  {assignmentData.instructions.map((inst, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-white/80 leading-relaxed"
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full bg-white/10 text-white/50 text-xs flex items-center justify-center font-mono mt-0.5">
                        {i + 1}
                      </span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>

        {/* Right: Submission Box */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 sticky top-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Your Submission
            </h3>

            {!isCompleted ? (
              <div className="flex flex-col gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className={cn(
                    "p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center gap-2 min-h-[150px] cursor-pointer group transition-colors",
                    file
                      ? "border-primary/50 bg-primary/5"
                      : "border-white/20 bg-black/20 hover:border-primary/50",
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-full transition-colors",
                      file
                        ? "bg-primary/20 text-primary"
                        : "bg-white/5 group-hover:bg-primary/10",
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={cn(
                        file
                          ? "text-primary"
                          : "text-white/50 group-hover:text-primary",
                      )}
                    >
                      {file ? (
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      ) : (
                        <>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" x2="12" y1="3" y2="15" />
                        </>
                      )}
                    </svg>
                  </div>
                  <div className="text-sm text-white/60">
                    {file ? (
                      <span className="text-primary font-medium">
                        {file.name}
                      </span>
                    ) : (
                      <>
                        <span className="text-primary font-medium">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </>
                    )}
                  </div>
                  <p className="text-xs text-white/30">
                    {assignmentData.submission.allowedFormats
                      ?.join(", ")
                      .toUpperCase()}{" "}
                    (Max {assignmentData.submission.maxFileSizeMB}MB)
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!file || isSubmitting}
                  className="w-full py-2.5 rounded-lg bg-primary text-black font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Assignment"
                  )}
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-green-400 font-medium">
                  Assignment Submitted
                </p>
                <p className="text-xs text-white/40">
                  You can no longer edit this submission.
                </p>
              </div>
            )}

            {assignmentData.dueDate && (
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/40 flex justify-between">
                <span>Due Date:</span>
                <span className="text-white/70">
                  {new Date(assignmentData.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
