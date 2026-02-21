"use client";

import { assessmentApi } from "@/services/classroom/assessment-api";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Clock,
  Loader2,
} from "lucide-react";

interface AssignmentListProps {
  onSelect: (id: string) => void;
}

export function AssignmentList({ onSelect }: AssignmentListProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["instructor-assignments-grading"],
    queryFn: () => assessmentApi.getAssignmentsForGrading(),
  });

  const assignments = data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  if (!assignments.length) {
    return (
      <div className="text-center py-20 text-white/30">
        <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No submitted assignments yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {assignments.map((a: any) => {
        const allGraded = a.gradedCount === a.totalSubmissions;
        const pendingCount = a.totalSubmissions - a.gradedCount;

        return (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            className="flex items-center justify-between p-4 bg-dark-card border border-white/5 rounded-xl hover:border-white/10 transition-all text-left group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">
                {a.title}
              </p>
              <p className="text-[11px] text-white/30 mt-0.5">
                {a.courseTitle} · {a.totalMarks} marks
                {a.dueDate && (
                  <> · Due {new Date(a.dueDate).toLocaleDateString()}</>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 ml-4 shrink-0">
              {allGraded ? (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  All graded
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {pendingCount} pending
                </span>
              )}

              <span className="text-[10px] text-white/25">
                {a.gradedCount}/{a.totalSubmissions}
              </span>

              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
