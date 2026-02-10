"use client";

import {
    CheckCircle
} from "lucide-react";

// ========================================================
// TEXT CONTENT
// ========================================================
function TextContent({ content }: { content: any }) {
  return (
    <div className="w-full max-w-3xl">
      <div className="bg-dark-card rounded-2xl p-8 border border-white/5 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-4">
          {content.title}
        </h2>
        <p className="text-white/60 text-sm">
          Text content viewer coming soon.
        </p>
        {content.isCompleted && (
          <p className="flex items-center gap-2 text-emerald-400 text-sm mt-4">
            <CheckCircle className="w-4 h-4" />
            Completed
          </p>
        )}
      </div>
    </div>
  );
}


export default TextContent;
