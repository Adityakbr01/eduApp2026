"use client";

import { useState } from "react";
import { AssignmentList } from "./AssignmentList";
import { SubmissionsView } from "./SubmissionsView";

export default function GradingPage() {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);

  return (
    <div className="max-w-7xl mx-auto">
      {!selectedAssignmentId ? (
        <>
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white">Assignment Grading</h1>
            <p className="text-xs text-white/30 mt-1">
              Assignments with student submissions
            </p>
          </div>
          <AssignmentList onSelect={setSelectedAssignmentId} />
        </>
      ) : (
        <SubmissionsView
          assignmentId={selectedAssignmentId}
          onBack={() => setSelectedAssignmentId(null)}
        />
      )}
    </div>
  );
}
