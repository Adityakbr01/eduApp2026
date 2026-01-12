"use client";

import { uploadApi } from "@/services/uploads";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { getS3PublicUrl } from "./getS3PublicUrl";

interface Props {
  draftId: string; // draftId OR real courseId
  value?: string; // S3 key
  onChange: (value: string) => void;
}

export default function CourseImageUploader({
  draftId,
  value,
  onChange,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🟢 Handle EDIT MODE image
  useEffect(() => {
    if (value) {
      setPreview(getS3PublicUrl(value));
    }
  }, [value]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setLoading(true);
      setError(null);

      try {
        // 🔥 Instant local preview
        setPreview(URL.createObjectURL(file));

        const res = await uploadApi.getCourseImagePresignedUrl(
          file.name,
          file.size,
          file.type,
          draftId
        );

        console.log("Presigned URL response:", res);

        if (res.mode !== "simple") {
          throw new Error("Multipart upload not supported for images");
        }

        // ✅ TypeScript now knows uploadUrl exists
        const { uploadUrl, intentId } = res;

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error("Upload failed");
        }

        onChange(intentId);
      } catch (err: any) {
        setError(err.message || "Upload failed");
      } finally {
        setLoading(false);
      }
    },
    [draftId, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
        `}
      >
        <input {...getInputProps()} />
        {loading ? "Uploading..." : "Click or drag image here"}
      </div>

      {/* 🖼 Existing OR newly uploaded image */}
      {preview && (
        <img
          src={preview}
          alt="Course cover"
          className="mt-4 rounded-lg border w-full max-w-sm"
        />
      )}

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}
