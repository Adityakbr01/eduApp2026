"use client";

import { useState } from "react";
import { uploadApi } from "@/services/uploads/api";
import { multipartUpload } from "./multipartUpload";

interface Props {
  courseId: string;
  lessonId: string;
  draftID?: string;
  onUploaded: (s3Key: string) => void; // 🔥 important
}

export default function LessonVideoUpload({
  courseId,
  lessonId,
  onUploaded,
  draftID,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setProgress(0);

      // 1️⃣ Ask backend
      const presign = await uploadApi.getLessonVideoPresignedUrl(
        file,
        courseId,
        lessonId,
        draftID!
      );

      // ---------------- SIMPLE ----------------
      if (presign.mode === "simple") {
        await fetch(presign.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        setProgress(100);
        onUploaded(presign.intentId); // ✅ RETURN KEY
        return;
      }

      // ---------------- MULTIPART ----------------
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

      // ⚠️ REQUIRED – warna file exist hi nahi karegi
      await uploadApi.completeMultipart(presign.intentId, init.uploadId, parts);

      onUploaded(presign.intentId); // ✅ FINAL KEY
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {uploading && (
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
