"use client";

import axios from "axios";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

import { Progress } from "@/components/ui/progress";
import { FileTypeEnum } from "@/services/uploads";
import uploadApi from "@/services/uploads/api";
import isAllowedFile from "../utils/isAllowedFile";
import { multipartUpload } from "./multipartUpload";
import { UploadItem } from "./types";

interface S3UploaderProps {
  onUploaded: (keys: string[]) => void;
  initialValue?: string;

  accept?: Record<string, string[]>;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSizeMB?: number;

  autoUpload?: boolean;
  parallelUploads?: number;
  uploadType?: FileTypeEnum;
  getKey?: (file: File) => string; // ✅ dynamic folder structure
  onDrop?: (acceptedFiles: File[]) => void;
}

export function S3Uploader({
  onUploaded,
  initialValue,
  accept = { "image/*": [] },
  multiple = true,
  maxFiles = 5,
  maxFileSizeMB = 5,
  autoUpload = true,
  parallelUploads = 2,
  uploadType = "image",
  getKey,
}: S3UploaderProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const activeUploads = useRef(0);

  console.log(uploadType, accept)

  // ---------- INITIAL ----------
  useEffect(() => {
    if (initialValue) {
      setItems([
        {
          preview: initialValue,
          progress: 100,
          status: "success",
          file: null as unknown as File,
          controller: new AbortController(),
          key: initialValue,
        },
      ]);
    }
  }, [initialValue]);

  useEffect(() => {
    return () => {
      items.forEach(item => {
        if (item.preview?.startsWith("blob:")) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [items]);

  // ---------- DROP ----------
  const onDrop = useCallback(
    (files: File[]) => {
      const filtered = files.filter(file =>
        isAllowedFile(file, accept)
      );

      const valid = filtered
        .slice(0, maxFiles)
        .filter(f => f.size <= maxFileSizeMB * 1024 * 1024);

      const mapped = valid.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: "idle" as const,
        controller: new AbortController(),
      }));

      setItems(prev =>
        multiple ? [...prev, ...mapped].slice(0, maxFiles) : mapped.slice(0, 1)
      );
    },
    [multiple, maxFiles, maxFileSizeMB, accept]
  );



  // ---------- UPLOAD ----------
  const uploadOne = async (item: UploadItem, index: number) => {
    try {
      setItems(i =>
        i.map((x, idx) =>
          idx === index ? { ...x, status: "uploading" } : x
        )
      );

      // generate dynamic key
      const key = getKey ? getKey(item.file) : item.file.name;

      const presign = await uploadApi.getPresignedUrl(
        item.file.name,
        item.file.size,
        uploadType,
        key
      );

      // SIMPLE
      if (presign.mode === "simple") {
        await axios.put(presign.uploadUrl, item.file, {
          headers: {
            "Content-Type": item.file.type,
          },
          onUploadProgress: e => {
            if (!e.total) return;
            const p = Math.round((e.loaded * 100) / e.total);
            setItems(i =>
              i.map((x, idx) =>
                idx === index ? { ...x, progress: p } : x
              )
            );
          },
        });

        setItems(i =>
          i.map((x, idx) =>
            idx === index
              ? { ...x, status: "success", progress: 100, key: presign.intentId }
              : x
          )
        );

        onUploaded([presign.key]);
        return;
      }

      // MULTIPART
      const info = await uploadApi.initMultipart(
        presign.intentId,
        item.file.size
      );

      const parts = await multipartUpload(
        item.file,
        {
          intentId: presign.intentId,
          uploadId: info.uploadId,
          partSize: info.partSize,
          totalParts: info.totalParts,
        },
        p =>
          setItems(i =>
            i.map((x, idx) =>
              idx === index ? { ...x, progress: p } : x
            )
          )
      );

      const completed = await uploadApi.completeMultipart(
        presign.intentId,
        info.uploadId,
        parts
      );

      setItems(i =>
        i.map((x, idx) =>
          idx === index
            ? { ...x, status: "success", progress: 100, key: completed.key }
            : x
        )
      );

      onUploaded([completed.key]);
    } catch (e) {
      setItems(i =>
        i.map((x, idx) =>
          idx === index ? { ...x, status: "error" } : x
        )
      );
    } finally {
      activeUploads.current--;
    }
  };

  // ---------- QUEUE ----------
  useEffect(() => {
    if (!autoUpload) return;

    const pending = items
      .map((x, i) => (x.status === "idle" ? i : null))
      .filter((i): i is number => i !== null);

    for (const i of pending) {
      if (activeUploads.current >= parallelUploads) return;
      activeUploads.current++;
      uploadOne(items[i], i);
    }
  }, [items]);

  // ---------- UI ----------
  const { getRootProps, getInputProps } = useDropzone({
    multiple,
    maxFiles,
    onDrop: (acceptedFiles) => {
      // Call external onDrop if provided (for duration calculation)
      if (onDrop) {
        onDrop(acceptedFiles);
      }

      // Your existing logic
      const filtered = acceptedFiles.filter(file =>
        isAllowedFile(file, accept)
      );

      const valid = filtered
        .slice(0, maxFiles)
        .filter(f => f.size <= maxFileSizeMB! * 1024 * 1024);

      const mapped = valid.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: "idle" as const,
        controller: new AbortController(),
      }));

      setItems(prev =>
        multiple ? [...prev, ...mapped].slice(0, maxFiles) : mapped.slice(0, 1)
      );
    },
    accept,
  });



  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className="rounded-xl border-2 border-dashed p-6 cursor-pointer"
      >
        <input {...getInputProps()} />

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Drop files or click to upload
          </p>
        )}

        {items.map((item, i) => {
          const isUploaded = item.status === "success" && item.key;
          const imageUrl = isUploaded
            ? `https://eduapp2026-s3-bucket.s3.us-east-1.amazonaws.com/${item.key}`
            : item.preview;

          return (
            <div key={i} className="relative border rounded-lg overflow-hidden">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={`Upload preview ${i}`}
                  width={400}
                  height={225}
                  className="h-48 w-full object-cover"
                // unoptimized={imageUrl.startsWith("blob:")} // Critical for blob URLs
                />
              )}

              {item.status !== "success" && (
                <div className="absolute inset-x-0 bottom-0 bg-black/50 p-1">
                  <Progress value={item.progress} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
