"use client";

import { useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    MoreVertical,
    Trash2,
    Eye,
    EyeOff,
    Clock,
    Star,
    Pencil,
    Upload,
    Loader2,
    CheckCircle2,
    X,
    FileVideo,
    FileAudio,
    FileText,
    HelpCircle,
    ClipboardList,
} from "lucide-react";

import {
    useUpdateContent,
    useDeleteContent,
    ILessonContent,
    ContentType,
    UpdateContentDTO,
} from "@/services/courses";
import {
    useUploadLessonVideo,
    useUploadLessonDocument,
    useUploadLessonAudio,
    UploadProgress,
} from "@/services/uploads";
import { useQuizByContentId, useAssignmentByContentId } from "@/services/assessments";
import { QuizDialog } from "./QuizDialog";
import { AssignmentDialog } from "./AssignmentDialog";

interface ContentItemProps {
    content: ILessonContent;
    lessonId: string;
    courseId: string;
    icon: React.ReactNode;
}

const contentTypeLabels: Record<ContentType, string> = {
    [ContentType.VIDEO]: "Video",
    [ContentType.PDF]: "PDF",
    [ContentType.TEXT]: "Text",
    [ContentType.QUIZ]: "Quiz",
    [ContentType.ASSIGNMENT]: "Assignment",
    [ContentType.AUDIO]: "Audio",
};

// Helper to format duration in seconds to mm:ss
const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    return `${seconds}s`;
};

export function ContentItem({ content, lessonId, courseId, icon }: ContentItemProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [quizDialogOpen, setQuizDialogOpen] = useState(false);
    const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);

    // Edit form states
    const [editTitle, setEditTitle] = useState(content.title);
    const [editMarks, setEditMarks] = useState(content.marks);
    const [editIsPreview, setEditIsPreview] = useState(content.isPreview);
    const [editDuration, setEditDuration] = useState(content.video?.duration || 0);
    const [editMinWatchPercent, setEditMinWatchPercent] = useState(content.video?.minWatchPercent || 90);

    // File upload states
    const [newFileUrl, setNewFileUrl] = useState("");
    const [newFileName, setNewFileName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [isDurationAutoCalculated, setIsDurationAutoCalculated] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateContent = useUpdateContent();
    const deleteContent = useDeleteContent();
    const uploadVideo = useUploadLessonVideo();
    const uploadDocument = useUploadLessonDocument();
    const uploadAudio = useUploadLessonAudio();

    // Fetch existing quiz/assignment for this content
    const { data: existingQuiz } = useQuizByContentId(
        content._id,
        content.type === ContentType.QUIZ
    );
    const { data: existingAssignment } = useAssignmentByContentId(
        content._id,
        content.type === ContentType.ASSIGNMENT
    );

    const isLoading = updateContent.isPending || isUploading;

    const handleToggleVisibility = () => {
        updateContent.mutate({
            contentId: content._id,
            data: { isVisible: !content.isVisible },
            lessonId,
        });
    };

    const handleTogglePreview = () => {
        updateContent.mutate({
            contentId: content._id,
            data: { isPreview: !content.isPreview },
            lessonId,
        });
    };

    const handleDelete = async () => {
        try {
            await deleteContent.mutateAsync({ contentId: content._id, lessonId });
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Error deleting content:", error);
        }
    };

    const handleEditOpen = () => {
        setEditTitle(content.title);
        setEditMarks(content.marks);
        setEditIsPreview(content.isPreview);
        setEditDuration(content.video?.duration || 0);
        setEditMinWatchPercent(content.video?.minWatchPercent || 90);
        setNewFileUrl("");
        setNewFileName("");
        setUploadComplete(false);
        setIsDurationAutoCalculated(false);
        setEditDialogOpen(true);
    };

    // Calculate video/audio duration
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

    // Handle file selection and auto-upload
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            setUploadComplete(false);
            setNewFileName(file.name);

            // If video/audio, calculate duration
            if (content.type === ContentType.VIDEO || content.type === ContentType.AUDIO) {
                const calculatedDuration = await calculateMediaDuration(file);
                setEditDuration(calculatedDuration);
                setIsDurationAutoCalculated(true);
            }

            // Upload to Cloudinary based on content type
            let uploadResult;
            if (content.type === ContentType.PDF) {
                uploadResult = await uploadDocument.mutateAsync({
                    file,
                    onProgress: handleProgressUpdate,
                });
            } else if (content.type === ContentType.AUDIO) {
                uploadResult = await uploadAudio.mutateAsync({
                    file,
                    onProgress: handleProgressUpdate,
                });
            } else {
                uploadResult = await uploadVideo.mutateAsync({
                    file,
                    onProgress: handleProgressUpdate,
                });
            }

            setNewFileUrl(uploadResult.data?.url || "");
            setUploadComplete(true);
        } catch (error) {
            console.error("Error uploading file:", error);
            setNewFileName("");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const clearNewUpload = () => {
        setNewFileUrl("");
        setNewFileName("");
        setUploadComplete(false);
        setIsDurationAutoCalculated(false);
        // Reset duration to original
        setEditDuration(content.video?.duration || 0);
    };

    const handleEditSave = async () => {
        try {
            const updateData: UpdateContentDTO = {
                title: editTitle,
                marks: editMarks,
                isPreview: editIsPreview,
            };

            // If video/audio content with changes
            if (content.type === ContentType.VIDEO || content.type === ContentType.AUDIO) {
                updateData.video = {
                    url: newFileUrl || content.video?.url,
                    duration: editDuration,
                    minWatchPercent: editMinWatchPercent,
                };
            }

            // If PDF content with new file
            if (content.type === ContentType.PDF && newFileUrl) {
                updateData.pdf = {
                    url: newFileUrl,
                };
            }

            await updateContent.mutateAsync({
                contentId: content._id,
                data: updateData,
                lessonId,
            });
            setEditDialogOpen(false);
        } catch (error) {
            console.error("Error updating content:", error);
        }
    };

    // Get current file URL for display
    const getCurrentFileUrl = () => {
        if (content.type === ContentType.VIDEO || content.type === ContentType.AUDIO) {
            return content.video?.url;
        }
        if (content.type === ContentType.PDF) {
            return content.pdf?.url;
        }
        return undefined;
    };

    // Get file accept type based on content type
    const getFileAccept = () => {
        switch (content.type) {
            case ContentType.VIDEO:
                return "video/*";
            case ContentType.AUDIO:
                return "audio/*";
            case ContentType.PDF:
                return ".pdf";
            default:
                return "*/*";
        }
    };

    const getFileIcon = () => {
        switch (content.type) {
            case ContentType.VIDEO:
                return <FileVideo className="h-8 w-8 text-muted-foreground" />;
            case ContentType.AUDIO:
                return <FileAudio className="h-8 w-8 text-muted-foreground" />;
            case ContentType.PDF:
                return <FileText className="h-8 w-8 text-muted-foreground" />;
            default:
                return <Upload className="h-8 w-8 text-muted-foreground" />;
        }
    };

    return (
        <>
            <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 group">
                <span className="text-muted-foreground">{icon}</span>
                <span className="flex-1 text-sm truncate">{content.title}</span>
                <Badge variant="outline" className="text-xs">
                    {contentTypeLabels[content.type]}
                </Badge>
                {/* Show marks */}
                <span className="flex items-center gap-1 text-xs text-muted-foreground" title="Marks">
                    <Star className="h-3 w-3" />
                    {content.marks}
                </span>
                {/* Show duration from nested video object */}
                {content.video?.duration && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground" title="Duration">
                        <Clock className="h-3 w-3" />
                        {formatDuration(content.video.duration)}
                    </span>
                )}
                {/* Show preview badge */}
                {content.isPreview && (
                    <Badge variant="secondary" className="text-xs">
                        Preview
                    </Badge>
                )}
                {!content.isVisible && (
                    <span title="Hidden">
                        <EyeOff className="h-3 w-3 text-muted-foreground" />
                    </span>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        >
                            <MoreVertical className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleEditOpen}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        {/* Quiz management */}
                        {content.type === ContentType.QUIZ && (
                            <DropdownMenuItem onClick={() => setQuizDialogOpen(true)}>
                                <HelpCircle className="h-4 w-4 mr-2" />
                                {existingQuiz ? "Edit Quiz" : "Create Quiz"}
                            </DropdownMenuItem>
                        )}
                        {/* Assignment management */}
                        {content.type === ContentType.ASSIGNMENT && (
                            <DropdownMenuItem onClick={() => setAssignmentDialogOpen(true)}>
                                <ClipboardList className="h-4 w-4 mr-2" />
                                {existingAssignment ? "Edit Assignment" : "Create Assignment"}
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={handleToggleVisibility}>
                            {content.isVisible ? (
                                <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Hide
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Show
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleTogglePreview}>
                            {content.isPreview ? (
                                <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Remove Preview
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Set as Preview
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => setDeleteDialogOpen(true)}
                            className="text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Content</DialogTitle>
                        <DialogDescription>
                            Update content details. Upload a new file to replace the existing one.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Marks & Preview Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-marks">Marks</Label>
                                <Input
                                    id="edit-marks"
                                    type="number"
                                    min={0}
                                    value={editMarks}
                                    onChange={(e) => setEditMarks(parseInt(e.target.value) || 0)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Free Preview</Label>
                                <div className="flex items-center gap-2 h-10">
                                    <Switch
                                        checked={editIsPreview}
                                        onCheckedChange={setEditIsPreview}
                                        disabled={isLoading}
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        {editIsPreview ? "Yes" : "No"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Current File Info */}
                        {getCurrentFileUrl() && !newFileUrl && (
                            <div className="space-y-2">
                                <Label>Current File</Label>
                                <div className="border rounded-lg p-3 bg-muted/50">
                                    <p className="text-sm text-muted-foreground truncate">
                                        {getCurrentFileUrl()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Upload Progress */}
                        {isUploading && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Uploading {newFileName}...
                                    </span>
                                    <span className="font-medium">{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-2" />
                            </div>
                        )}

                        {/* File Upload Area */}
                        {(content.type === ContentType.VIDEO ||
                            content.type === ContentType.AUDIO ||
                            content.type === ContentType.PDF) && (
                                <div className="space-y-2">
                                    <Label>Replace File (optional)</Label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept={getFileAccept()}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        disabled={isLoading}
                                    />
                                    {uploadComplete && newFileUrl ? (
                                        <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    <div>
                                                        <p className="text-sm font-medium">{newFileName}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            New file uploaded
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={clearNewUpload}
                                                    disabled={isLoading}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => !isLoading && fileInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                                            border-muted-foreground/25 hover:border-primary/50
                                            ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                {getFileIcon()}
                                                <p className="text-sm text-muted-foreground">
                                                    Click to upload new file
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        {/* Video/Audio specific fields */}
                        {(content.type === ContentType.VIDEO || content.type === ContentType.AUDIO) && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-duration">Duration (seconds)</Label>
                                    <Input
                                        id="edit-duration"
                                        type="number"
                                        value={editDuration}
                                        onChange={(e) => setEditDuration(parseInt(e.target.value) || 0)}
                                        disabled={isDurationAutoCalculated || isLoading}
                                        className={isDurationAutoCalculated ? "bg-muted" : ""}
                                    />
                                    {isDurationAutoCalculated && (
                                        <p className="text-xs text-green-600">
                                            ✓ Auto: {formatDuration(editDuration)}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-min-watch">Min Watch %</Label>
                                    <Input
                                        id="edit-min-watch"
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={editMinWatchPercent}
                                        onChange={(e) => setEditMinWatchPercent(parseInt(e.target.value) || 90)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditSave}
                            disabled={isLoading || !editTitle.trim()}
                        >
                            {updateContent.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Content</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{content.title}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Quiz Dialog */}
            {content.type === ContentType.QUIZ && (
                <QuizDialog
                    open={quizDialogOpen}
                    onOpenChange={setQuizDialogOpen}
                    courseId={courseId}
                    lessonId={lessonId}
                    contentId={content._id}
                    existingQuiz={existingQuiz}
                />
            )}

            {/* Assignment Dialog */}
            {content.type === ContentType.ASSIGNMENT && (
                <AssignmentDialog
                    open={assignmentDialogOpen}
                    onOpenChange={setAssignmentDialogOpen}
                    courseId={courseId}
                    lessonId={lessonId}
                    contentId={content._id}
                    existingAssignment={existingAssignment}
                />
            )}
        </>
    );
}
