"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Upload,
    X,
    Video,
    FileText,
    Image as ImageIcon,
    Loader2,
    File,
    Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    useUploadLessonContent,
    useDeleteUpload,
    UploadProgress,
} from "@/services/uploads";

type ContentType = "video" | "image" | "document";

interface FileUploadProps {
    value?: string;
    publicId?: string;
    contentType?: ContentType;
    onChange: (url: string, publicId: string, type: ContentType) => void;
    onRemove?: () => void;
    className?: string;
    disabled?: boolean;
    accept?: string;
}

// Helper to detect content type from mime type
const getContentType = (mimeType: string): ContentType => {
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType === "application/pdf") return "document";
    return "document";
};

// Helper to get icon for content type
const getContentIcon = (type?: ContentType) => {
    switch (type) {
        case "video":
            return Video;
        case "image":
            return ImageIcon;
        case "document":
            return FileText;
        default:
            return File;
    }
};

// Format file size
const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

export function FileUpload({
    value,
    publicId,
    contentType,
    onChange,
    onRemove,
    className,
    disabled = false,
    accept = "video/*,image/*,application/pdf",
}: FileUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadMutation = useUploadLessonContent();
    const deleteMutation = useDeleteUpload();

    const handleProgress = useCallback((progress: UploadProgress) => {
        setUploadProgress(progress);
    }, []);

    const handleUpload = useCallback(
        async (file: File) => {
            // Validate file size (500MB max)
            const maxSize = 500 * 1024 * 1024;
            if (file.size > maxSize) {
                return;
            }

            setFileName(file.name);
            setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

            try {
                const result = await uploadMutation.mutateAsync({
                    file,
                    onProgress: handleProgress,
                });

                if (result.success && result.data) {
                    const type = getContentType(file.type);
                    onChange(result.data.url, result.data.publicId, type);
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
        setFileName("");
        onRemove?.();
    }, [publicId, deleteMutation, onRemove]);

    const isUploading = uploadMutation.isPending;
    const isDeleting = deleteMutation.isPending;
    const ContentIcon = getContentIcon(contentType);

    return (
        <div className={className}>
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || isUploading}
            />

            {value ? (
                // File Preview
                <Card className="relative overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                        {/* Preview/Icon */}
                        <div className="shrink-0">
                            {contentType === "video" ? (
                                <div className="relative w-24 h-16 bg-muted rounded overflow-hidden flex items-center justify-center">
                                    <Play className="h-8 w-8 text-muted-foreground" />
                                </div>
                            ) : contentType === "image" ? (
                                <div className="relative w-24 h-16 bg-muted rounded overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={value}
                                        alt="Content preview"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                                    <ContentIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {fileName || "Uploaded content"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                    {contentType?.toUpperCase() || "FILE"}
                                </Badge>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
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
                                size="icon"
                                className="h-8 w-8"
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
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                        {isUploading ? (
                            <>
                                <Loader2 className="h-10 w-10 text-muted-foreground mb-4 animate-spin" />
                                <p className="text-sm font-medium mb-1">
                                    Uploading {fileName}...
                                </p>
                                {uploadProgress && (
                                    <div className="w-full max-w-xs mt-2">
                                        <Progress value={uploadProgress.percentage} className="h-2" />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>{formatFileSize(uploadProgress.loaded)}</span>
                                            <span>{uploadProgress.percentage}%</span>
                                            <span>{formatFileSize(uploadProgress.total)}</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="rounded-full bg-muted p-4 mb-4">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium mb-1">
                                    Drag and drop a file, or click to browse
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Supports: Video (MP4, WebM), Image (JPG, PNG), PDF
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Max size: 500MB for videos, 20MB for documents
                                </p>
                            </>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}

export default FileUpload;
