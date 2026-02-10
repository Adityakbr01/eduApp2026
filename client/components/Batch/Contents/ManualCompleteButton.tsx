"use client";

import { QUERY_KEYS } from "@/config/query-keys";
import { contentProgressApi } from "@/services/classroom/content-progress-api";
import { useQueryClient } from "@tanstack/react-query";
import {
    CheckCircle,
    Loader2
} from "lucide-react";
import { useState } from "react";


// ========================================================
// MANUAL COMPLETE BUTTON
// ========================================================
function ManualCompleteButton({
  contentId,
  courseId,
  marks,
}: {
  contentId: string;
  courseId: string;
  marks: number;
}) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleManualComplete = async () => {
    setLoading(true);
    try {
      await contentProgressApi.markCompleted(contentId, {
        completionMethod: "manual",
      });
      setDone(true);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CLASSROOM.CONTENT(courseId, contentId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CLASSROOM.BATCH(courseId),
      });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 text-amber-400 text-sm mt-6">
        <CheckCircle className="w-4 h-4" />
        Marked complete — {Math.floor(marks * 0.9)}/{marks} marks (manual)
      </div>
    );
  }

  return (
    <button
      onClick={handleManualComplete}
      disabled={loading}
      className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all text-sm font-medium disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CheckCircle className="w-4 h-4" />
      )}
      Mark as Complete (90% marks)
    </button>
  );
}


export default ManualCompleteButton;