"use client";

import { Award } from "lucide-react";

const BatchCertificate = () => {
  return (
    <div className="bg-dark-card rounded-2xl border border-white/5 w-full h-full flex flex-col items-center justify-center p-8 gap-4 text-center">
      <div className="w-20 h-20 bg-amber-400/10 rounded-full flex items-center justify-center mb-2">
        <Award className="w-10 h-10 text-amber-400" />
      </div>
      <h2 className="text-2xl font-bold text-white">Course Certificate</h2>
      <p className="text-white/50 max-w-xs">
        Complete all modules and assignments to unlock your course completion
        certificate.
      </p>
      <div className="w-full max-w-xs h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
        <div className="h-full w-[45%] bg-amber-400 rounded-full" />
      </div>
      <span className="text-sm text-amber-400 font-medium">45% Progress</span>
    </div>
  );
};

export default BatchCertificate;
