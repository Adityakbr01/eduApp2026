"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { uploadApi } from "@/services/uploads";

interface Props {
  courseId: string;
  lessonId: string;
  lessonContentId: string;
  disabled?: boolean;
  onUploaded: (vdoId?: string) => void;
  onUploadStateChange: (uploading: boolean) => void;
}

export default function VdoCipherVideoUpload({
  courseId,
  lessonId,
  lessonContentId,
  disabled,
  onUploaded,
  onUploadStateChange,
}: Props) {
  const [progress, setProgress] = useState(0);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (disabled) {
      console.warn("🚫 Upload blocked: video not READY");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      onUploadStateChange(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("courseId", courseId);
      formData.append("lessonId", lessonId);
      formData.append("lessonContentId", lessonContentId);

      const { videoId } = await uploadApi.uploadVideoWithVdocipher(
        file,
        courseId,
        lessonId,
        lessonContentId,
        (percent) => setProgress(percent),
      );

      toast.success("Video uploaded successfully!", { id: videoId });
      onUploaded(videoId); // Pass videoId to parent
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      onUploadStateChange(false);
      setProgress(0);
      // Reset input value to allow re-uploading same file if needed
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input
        className="cursor-pointer block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100
        "
        type="file"
        accept="video/*"
        disabled={disabled}
        onChange={handleFileChange}
      />

      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
          <p className="text-xs text-right mt-1 text-gray-500">{progress}%</p>
        </div>
      )}
    </div>
  );
}
