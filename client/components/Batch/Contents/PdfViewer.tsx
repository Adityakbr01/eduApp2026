"use client";

import { CheckCircle } from "lucide-react";

// ========================================================
// PDF VIEWER
// ========================================================
function PdfViewer({
  src,
  contentId,
  marks,
  isCompleted,
}: {
  src: string;
  contentId: string;
  marks: number;
  isCompleted: boolean;
}) {
  return (
    <div className="w-full max-w-5xl">
      <div className="bg-dark-card rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
        <iframe
          src={src}
          className="w-full"
          style={{ height: "70vh" }}
          title="PDF Viewer"
        />
      </div>
      {isCompleted && (
        <p className="flex items-center justify-center gap-2 text-emerald-400 text-sm mt-4">
          <CheckCircle className="w-4 h-4" />
          Completed — {marks} marks
        </p>
      )}
    </div>
  );
}

export default PdfViewer;
