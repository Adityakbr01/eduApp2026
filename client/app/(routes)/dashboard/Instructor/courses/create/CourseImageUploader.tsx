"use client";

import { uploadApi } from "@/services/uploads";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { getS3PublicUrl } from "./getS3PublicUrl";

interface Thumbnail {
  key: string;
  version: number;
}

interface Props {
  courseId: string;
  value?: string | Thumbnail; // can be S3 key string or object
  onChange: (value: Thumbnail) => void;
  onUploadStateChange?: (isUploading: boolean) => void; // 🔥 new
}

export default function CourseImageUploader({
  courseId,
  value,
  onChange,
  onUploadStateChange,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🟢 Handle EDIT MODE image
  useEffect(() => {
    if (value) {
      const key = typeof value === "string" ? value : value.key;
      setPreview(getS3PublicUrl(key));
    }
  }, [value]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

       onUploadStateChange?.(true); // notify parent
      setLoading(true);
      setError(null);

      try {
        // 🔥 Instant local preview
        setPreview(URL.createObjectURL(file));

        const res = await uploadApi.getCourseImagePresignedUrl(
          file.name,
          file.size,
          file.type,
          courseId
        );

        if (res.mode !== "simple") {
          throw new Error("Multipart upload not supported for images");
        }

        const { uploadUrl, key, version } = res;

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

        // ✅ Send the thumbnail object to parent
        onChange({ key, version });
      } catch (err: any) {
        setError(err.message || "Upload failed");
      } finally {
        setLoading(false);
      onUploadStateChange?.(false); // notify parent
      }
    },
    [courseId, onChange]
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
