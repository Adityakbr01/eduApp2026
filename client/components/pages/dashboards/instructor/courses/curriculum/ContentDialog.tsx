"use client";

import { useState, useRef } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileVideo, FileAudio, FileText, CheckCircle2, X } from "lucide-react";

import { ContentType, CreateContentDTO, useCreateContent } from "@/services/courses";
import {
    useUploadLessonVideo,
    useUploadLessonDocument,
    useUploadLessonAudio,
    UploadProgress,
} from "@/services/uploads";

interface ContentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lessonId: string;
}

export function ContentDialog({ open, onOpenChange, lessonId }: ContentDialogProps) {
    const [contentType, setContentType] = useState<ContentType>(ContentType.VIDEO);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [marks, setMarks] = useState<number>(10);
    const [isPreview, setIsPreview] = useState(false);
    const [minWatchPercent, setMinWatchPercent] = useState<number>(90);

    // Uploaded URL states (auto-uploaded)
    const [videoUrl, setVideoUrl] = useState("");
    const [pdfUrl, setPdfUrl] = useState("");

    // File name for display
    const [fileName, setFileName] = useState("");

    // Duration state (auto-calculated for video/audio)
    const [duration, setDuration] = useState<number>(0);
    const [isDurationAutoCalculated, setIsDurationAutoCalculated] = useState(false);

    // Upload progress
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);

    // Refs for hidden inputs
    const videoInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);

    const createContent = useCreateContent();
    const uploadVideo = useUploadLessonVideo();
    const uploadDocument = useUploadLessonDocument();
    const uploadAudio = useUploadLessonAudio();

    const isLoading = createContent.isPending || isUploading;

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setMarks(10);
        setIsPreview(false);
        setMinWatchPercent(90);
        setVideoUrl("");
        setPdfUrl("");
        setFileName("");
        setDuration(0);
        setIsDurationAutoCalculated(false);
        setUploadProgress(0);
        setIsUploading(false);
        setUploadComplete(false);
        setContentType(ContentType.VIDEO);
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            resetForm();
        }
        onOpenChange(isOpen);
    };

    // Calculate video/audio duration when file is selected
    const calculateMediaDuration = (file: File): Promise<number> => {
        return new Promise((resolve) => {
            const url = URL.createObjectURL(file);
            const media = file.type.startsWith("audio/")
                ? new Audio(url)
                : document.createElement("video");

            media.preload = "metadata";
            media.onloadedmetadata = () => {
                URL.revokeObjectURL(url);
                resolve(Math.round(media.duration));
            };
            media.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(0);
            };
            media.src = url;
        });
    };

    const handleProgressUpdate = (progress: UploadProgress) => {
        setUploadProgress(progress.percentage);
    };

    // Auto-upload video when selected
    const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            setUploadComplete(false);
            setFileName(file.name);

            // Calculate duration first
            const calculatedDuration = await calculateMediaDuration(file);
            setDuration(calculatedDuration);
            setIsDurationAutoCalculated(true);

            // Auto-upload to Cloudinary
            const uploadResult = await uploadVideo.mutateAsync({
                file,
                onProgress: handleProgressUpdate,
            });

            setVideoUrl(uploadResult.data?.url || "");
            setUploadComplete(true);
        } catch (error) {
            console.error("Error uploading video:", error);
            setFileName("");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // Auto-upload audio when selected
    const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            setUploadComplete(false);
            setFileName(file.name);

            // Calculate duration first
            const calculatedDuration = await calculateMediaDuration(file);
            setDuration(calculatedDuration);
            setIsDurationAutoCalculated(true);

            // Auto-upload to Cloudinary using audio endpoint
            const uploadResult = await uploadAudio.mutateAsync({
                file,
                onProgress: handleProgressUpdate,
            });

            setVideoUrl(uploadResult.data?.url || "");
            setUploadComplete(true);
        } catch (error) {
            console.error("Error uploading audio:", error);
            setFileName("");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // Auto-upload PDF when selected
    const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            setUploadComplete(false);
            setFileName(file.name);

            // Auto-upload to Cloudinary
            const uploadResult = await uploadDocument.mutateAsync({
                file,
                onProgress: handleProgressUpdate,
            });

            setPdfUrl(uploadResult.data?.url || "");
            setUploadComplete(true);
        } catch (error) {
            console.error("Error uploading PDF:", error);
            setFileName("");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const clearUpload = () => {
        setVideoUrl("");
        setPdfUrl("");
        setFileName("");
        setDuration(0);
        setIsDurationAutoCalculated(false);
        setUploadComplete(false);
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) return;

        // Map ContentType enum to DTO type
        const typeMap: Record<string, "video" | "audio" | "pdf" | "assignment" | "quiz"> = {
            [ContentType.VIDEO]: "video",
            [ContentType.AUDIO]: "audio",
            [ContentType.PDF]: "pdf",
            [ContentType.QUIZ]: "quiz",
            [ContentType.ASSIGNMENT]: "assignment",
        };

        const contentData: CreateContentDTO = {
            title: title.trim(),
            type: typeMap[contentType] || "video",
            marks: marks,
            isVisible: true,
            isPreview: isPreview,
        };

        // Add nested video object for video/audio (already uploaded)
        if ((contentType === ContentType.VIDEO || contentType === ContentType.AUDIO) && videoUrl) {
            contentData.video = {
                url: videoUrl,
                duration: duration > 0 ? duration : undefined,
                minWatchPercent: minWatchPercent,
            };
        }

        // Add nested pdf object for PDF (already uploaded)
        if (contentType === ContentType.PDF && pdfUrl) {
            contentData.pdf = {
                url: pdfUrl,
            };
        }

        try {
            await createContent.mutateAsync({
                lessonId,
                data: contentData,
            });
            handleOpenChange(false);
        } catch (error) {
            console.error("Error creating content:", error);
        }
    };

    // Check if form is valid for submission
    const isFormValid = () => {
        if (!title.trim()) return false;
        if (contentType === ContentType.VIDEO && !videoUrl) return false;
        if (contentType === ContentType.AUDIO && !videoUrl) return false;
        if (contentType === ContentType.PDF && !pdfUrl) return false;
        return true;
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Content</DialogTitle>
                    <DialogDescription>
                        Add new content to this lesson. Files are auto-uploaded to Cloudinary.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {/* Content Type */}
                        <div className="space-y-2">
                            <Label>Content Type</Label>
                            <Select
                                value={contentType}
                                onValueChange={(v) => {
                                    setContentType(v as ContentType);
                                    clearUpload();
                                }}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ContentType.VIDEO}>Video</SelectItem>
                                    <SelectItem value={ContentType.AUDIO}>Audio</SelectItem>
                                    <SelectItem value={ContentType.PDF}>PDF Document</SelectItem>
                                    <SelectItem value={ContentType.QUIZ}>Quiz</SelectItem>
                                    <SelectItem value={ContentType.ASSIGNMENT}>Assignment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="content-title">Title</Label>
                            <Input
                                id="content-title"
                                placeholder="e.g., Introduction Video"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="content-description">
                                Description <span className="text-muted-foreground">(optional)</span>
                            </Label>
                            <Textarea
                                id="content-description"
                                placeholder="Brief description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                                rows={2}
                            />
                        </div>

                        {/* Marks & Preview Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="content-marks">Marks</Label>
                                <Input
                                    id="content-marks"
                                    type="number"
                                    min={0}
                                    value={marks}
                                    onChange={(e) => setMarks(parseInt(e.target.value) || 0)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Free Preview</Label>
                                <div className="flex items-center gap-2 h-10">
                                    <Switch
                                        checked={isPreview}
                                        onCheckedChange={setIsPreview}
                                        disabled={isLoading}
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        {isPreview ? "Yes" : "No"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Upload Progress */}
                        {isUploading && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Uploading {fileName}...
                                    </span>
                                    <span className="font-medium">{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-2" />
                            </div>
                        )}

                        <Tabs value={contentType} className="mt-4">
                            <TabsList className="hidden">
                                <TabsTrigger value={ContentType.VIDEO}>Video</TabsTrigger>
                                <TabsTrigger value={ContentType.AUDIO}>Audio</TabsTrigger>
                                <TabsTrigger value={ContentType.PDF}>PDF</TabsTrigger>
                                <TabsTrigger value={ContentType.QUIZ}>Quiz</TabsTrigger>
                                <TabsTrigger value={ContentType.ASSIGNMENT}>Assignment</TabsTrigger>
                            </TabsList>

                            {/* VIDEO TAB */}
                            <TabsContent value={ContentType.VIDEO} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Upload Video</Label>
                                    <input
                                        ref={videoInputRef}
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoSelect}
                                        className="hidden"
                                        disabled={isLoading}
                                    />
                                    {uploadComplete && videoUrl ? (
                                        <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    <div>
                                                        <p className="text-sm font-medium">{fileName}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Uploaded successfully
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={clearUpload}
                                                    disabled={isLoading}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => !isLoading && videoInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                                                border-muted-foreground/25 hover:border-primary/50
                                                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <FileVideo className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">
                                                    Click to upload video
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    MP4, WebM, MOV (max 500MB)
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Duration & Min Watch % */}
                                {videoUrl && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="video-duration">Duration (seconds)</Label>
                                            <Input
                                                id="video-duration"
                                                type="number"
                                                value={duration}
                                                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                                                disabled={isDurationAutoCalculated}
                                                className={isDurationAutoCalculated ? "bg-muted" : ""}
                                            />
                                            {isDurationAutoCalculated && (
                                                <p className="text-xs text-green-600">
                                                    ✓ Auto: {formatDuration(duration)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="min-watch">Min Watch %</Label>
                                            <Input
                                                id="min-watch"
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={minWatchPercent}
                                                onChange={(e) => setMinWatchPercent(parseInt(e.target.value) || 90)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            {/* AUDIO TAB */}
                            <TabsContent value={ContentType.AUDIO} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Upload Audio</Label>
                                    <input
                                        ref={audioInputRef}
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleAudioSelect}
                                        className="hidden"
                                        disabled={isLoading}
                                    />
                                    {uploadComplete && videoUrl ? (
                                        <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    <div>
                                                        <p className="text-sm font-medium">{fileName}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Uploaded successfully
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={clearUpload}
                                                    disabled={isLoading}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => !isLoading && audioInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                                                border-muted-foreground/25 hover:border-primary/50
                                                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <FileAudio className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">
                                                    Click to upload audio
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    MP3, WAV, OGG (max 100MB)
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Duration & Min Watch % */}
                                {videoUrl && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="audio-duration">Duration (seconds)</Label>
                                            <Input
                                                id="audio-duration"
                                                type="number"
                                                value={duration}
                                                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                                                disabled={isDurationAutoCalculated}
                                                className={isDurationAutoCalculated ? "bg-muted" : ""}
                                            />
                                            {isDurationAutoCalculated && (
                                                <p className="text-xs text-green-600">
                                                    ✓ Auto: {formatDuration(duration)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="min-listen">Min Listen %</Label>
                                            <Input
                                                id="min-listen"
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={minWatchPercent}
                                                onChange={(e) => setMinWatchPercent(parseInt(e.target.value) || 90)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            {/* PDF TAB */}
                            <TabsContent value={ContentType.PDF} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Upload PDF</Label>
                                    <input
                                        ref={pdfInputRef}
                                        type="file"
                                        accept=".pdf"
                                        onChange={handlePdfSelect}
                                        className="hidden"
                                        disabled={isLoading}
                                    />
                                    {uploadComplete && pdfUrl ? (
                                        <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    <div>
                                                        <p className="text-sm font-medium">{fileName}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Uploaded successfully
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={clearUpload}
                                                    disabled={isLoading}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => !isLoading && pdfInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                                                border-muted-foreground/25 hover:border-primary/50
                                                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">
                                                    Click to upload PDF
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    PDF files only (max 20MB)
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* QUIZ TAB */}
                            <TabsContent value={ContentType.QUIZ} className="space-y-4">
                                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        Quiz content will be linked to a quiz module.
                                        After creating this content, you can add questions from the content menu.
                                    </p>
                                </div>
                            </TabsContent>

                            {/* ASSIGNMENT TAB */}
                            <TabsContent value={ContentType.ASSIGNMENT} className="space-y-4">
                                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        Assignment content will be linked to an assessment module.
                                        After creating this content, you can configure assignment details from the content menu.
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !isFormValid()}>
                            {createContent.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                "Add Content"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
