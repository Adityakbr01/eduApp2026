"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadCourseImage, useDeleteUpload, UploadProgress } from "@/services/uploads";
import Image from "next/image";

interface ImageUploadProps {
    value?: string;
    publicId?: string;
    onChange: (url: string, publicId: string) => void;
    onRemove?: () => void;
    className?: string;
    disabled?: boolean;
}

export function ImageUpload({
    value,
    publicId,
    onChange,
    onRemove,
    className,
    disabled = false,
}: ImageUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadMutation = useUploadCourseImage();
    const deleteMutation = useDeleteUpload();

    const handleProgress = useCallback((progress: UploadProgress) => {
        setUploadProgress(progress);
    }, []);

    const handleUpload = useCallback(
        async (file: File) => {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                return;
            }

            setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

            try {
                const result = await uploadMutation.mutateAsync({
                    file,
                    onProgress: handleProgress,
                });

                if (result.success && result.data) {
                    onChange(result.data.url, result.data.publicId);
                }
            } finally {
                setUploadProgress(null);
            }
        },
        [uploadMutation, onChange, handleProgress]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragOver(false);

            if (disabled) return;

            const file = e.dataTransfer.files[0];
            if (file) {
                handleUpload(file);
            }
        },
        [disabled, handleUpload]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleUpload(file);
            }
            // Reset input
            e.target.value = "";
        },
        [handleUpload]
    );

    const handleRemove = useCallback(async () => {
        if (publicId) {
            await deleteMutation.mutateAsync(publicId);
        }
        onRemove?.();
    }, [publicId, deleteMutation, onRemove]);

    const isUploading = uploadMutation.isPending;
    const isDeleting = deleteMutation.isPending;

    return (
        <div className={className}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || isUploading}
            />

            {value ? (
                // Image Preview
                <Card className="relative overflow-hidden group">
                    <div className="relative aspect-video">
                        <Image
                            src={value}
                            alt="Course cover"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={disabled || isUploading || isDeleting}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Replace
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleRemove}
                                disabled={disabled || isUploading || isDeleting}
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <X className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : (
                // Upload Area
                <Card
                    className={cn(
                        "relative border-2 border-dashed transition-colors cursor-pointer",
                        isDragOver && "border-primary bg-primary/5",
                        !isDragOver && "border-muted-foreground/25 hover:border-primary/50",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
                >
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        {isUploading ? (
                            <>
                                <Loader2 className="h-10 w-10 text-muted-foreground mb-4 animate-spin" />
                                <p className="text-sm font-medium mb-2">Uploading...</p>
                                {uploadProgress && (
                                    <div className="w-full max-w-xs">
                                        <Progress value={uploadProgress.percentage} className="h-2" />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {uploadProgress.percentage}%
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="rounded-full bg-muted p-4 mb-4">
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium mb-1">
                                    Drag and drop an image, or click to browse
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Recommended: 1280x720 (16:9), Max 5MB
                                </p>
                            </>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}

export default ImageUpload;
