"use client";

import { useState } from "react";
import { uploadApi } from "@/services/uploads/api";
import { multipartUpload } from "./multipartUpload";

interface Props {
  courseId: string;
  lessonId: string;
  lessonContentId: string;
    disabled?: boolean;
  onUploaded: (s3Key: string) => void;
  onUploadStateChange: (uploading: boolean) => void;
}

export default function LessonVideoUpload({
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

      const presign = await uploadApi.getLessonVideoPresignedUrl(
        file,
        courseId,
        lessonId,
        lessonContentId
      );

      // -------- SIMPLE --------
      if (presign.mode === "simple") {
        await fetch(presign.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        onUploaded(presign.rawKey);
        return;
      }

      // -------- MULTIPART --------
      const init = await uploadApi.initMultipart(presign.intentId, file.size);

      const parts = await multipartUpload(
        file,
        {
          intentId: presign.intentId,
          uploadId: init.uploadId,
          partSize: init.partSize,
          totalParts: init.totalParts,
        },
        setProgress
      );

      await uploadApi.completeMultipart(
        presign.intentId,
        init.uploadId,
        parts
      );

      onUploaded(presign.intentId);
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed");
    } finally {
      onUploadStateChange(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
      className="cursor-pointer"
        type="file"
        accept="video/*"
         disabled={disabled}
        onChange={handleFileChange}
      />

      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded">
          <div
            className="bg-blue-600 text-xs text-white text-center rounded"
            style={{ width: `${progress}%` }}
          >
            {progress}%
          </div>
        </div>
      )}
    </div>
  );
}

