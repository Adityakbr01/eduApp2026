"use client";

import { useState } from "react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    useAssignmentByContentId,
    useQuizByContentId,
} from "@/services/assessments";
import {
    ContentType,
    ILessonContent,
    UpdateContentDTO,
    useDeleteContent,
    useUpdateContent,
} from "@/services/courses";
import { FileType, FileTypeEnum } from "@/services/uploads";
import {
    ClipboardList,
    Clock,
    Eye,
    EyeOff,
    HelpCircle,
    Loader2,
    MoreVertical,
    Pencil,
    Star,
    Trash2,
} from "lucide-react";
import { AssignmentDialog } from "./AssignmentDialog";
import { QuizDialog } from "./QuizDialog";

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

const formatDuration = (seconds: number): string => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function ContentItem({
  content,
  lessonId,
  courseId,
  icon,
}: ContentItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);

  // Edit states
  const [editTitle, setEditTitle] = useState(content.title);
  const [editMarks, setEditMarks] = useState(content.marks);
  const [editIsPreview, setEditIsPreview] = useState(content.isPreview);
  const [editDuration, setEditDuration] = useState(
    content.video?.duration || content.audio?.duration || 0
  );
  const [editMinWatchPercent, setEditMinWatchPercent] = useState(
    content.video?.minWatchPercent || 90
  );

  // Upload states
  const [newFileKey, setNewFileKey] = useState<string>(""); // Raw S3 key
  const [fileName, setFileName] = useState<string>("");
  const [isDurationAutoCalculated, setIsDurationAutoCalculated] =
    useState(false);

  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();

  const { data: existingQuiz } = useQuizByContentId(
    content._id,
    content.type === ContentType.QUIZ
  );
  const { data: existingAssignment } = useAssignmentByContentId(
    content._id,
    content.type === ContentType.ASSIGNMENT
  );

  const isLoading = updateContent.isPending;

  // Local duration calculation from File object
  const calculateDurationLocally = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const media = file.type.startsWith("audio/")
        ? new Audio(url)
        : document.createElement("video");

      media.preload = "metadata";
      media.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(Math.round(media.duration || 0));
      };
      media.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(0);
      };
      media.src = url;
    });
  };

  const handleEditOpen = () => {
    setEditTitle(content.title);
    setEditMarks(content.marks);
    setEditIsPreview(content.isPreview);
    setEditDuration(content.video?.duration || content.audio?.duration || 0);
    setEditMinWatchPercent(content.video?.minWatchPercent || 90);
    setNewFileKey("");
    setFileName("");
    setIsDurationAutoCalculated(false);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      const updateData: UpdateContentDTO = {
        title: editTitle.trim(),
        marks: editMarks,
        isPreview: editIsPreview,
      };

      if (content.type === ContentType.VIDEO) {
        updateData.video = {
          rawKey: newFileKey || content.video?.url || "",
          duration: editDuration < 10 ? 10 : editDuration,
          minWatchPercent: editMinWatchPercent,
        };
      }

      if (content.type === ContentType.AUDIO) {
        updateData.audio = {
          rawKey: newFileKey || content.audio?.url || "",
          duration: editDuration < 10 ? 10 : editDuration,
        };
      }

      if (content.type === ContentType.PDF) {
        updateData.pdf = {
          rawKey: newFileKey || content.pdf?.url || "",
        };
      }

      await updateContent.mutateAsync({
        contentId: content._id,
        data: updateData,
        lessonId,
      });

      // Reset upload state
      setNewFileKey("");
      setFileName("");
      setIsDurationAutoCalculated(false);
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteContent.mutateAsync({ contentId: content._id, lessonId });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  const getCurrentFileUrl = () => {
    if (content.type === ContentType.VIDEO) return content.video?.url;
    if (content.type === ContentType.AUDIO) return content.audio?.url;
    if (content.type === ContentType.PDF) return content.pdf?.url;
    return undefined;
  };

  const getFileAccept = (): string => {
    switch (content.type) {
      case ContentType.VIDEO:
        return "video/*";
      case ContentType.AUDIO:
        return "audio/*";
      case ContentType.PDF:
        return "application/pdf";
      default:
        return "*/*";
    }
  };

  const getUploadType = (): FileTypeEnum => {
    return content.type === ContentType.PDF
      ? FileType.DOCUMENT
      : FileType.VIDEO;
  };

  return (
    <>
      {/* List Item */}
      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 group">
        <span className="text-muted-foreground">{icon}</span>
        <span className="flex-1 text-sm truncate">{content.title}</span>
        <Badge variant="outline" className="text-xs">
          {contentTypeLabels[content.type]}
        </Badge>
        <span
          className="flex items-center gap-1 text-xs text-muted-foreground"
          title="Marks"
        >
          <Star className="h-3 w-3" /> {content.marks}
        </span>
        {(content.video?.duration || content.audio?.duration) && (
          <span
            className="flex items-center gap-1 text-xs text-muted-foreground"
            title="Duration"
          >
            <Clock className="h-3 w-3" />
            {formatDuration(
              content.video?.duration || content.audio?.duration || 0
            )}
          </span>
        )}
        {content.isPreview && (
          <Badge variant="secondary" className="text-xs">
            Preview
          </Badge>
        )}
        {!content.isVisible && (
          <EyeOff className="h-3 w-3 text-muted-foreground" />
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
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            {content.type === ContentType.QUIZ && (
              <DropdownMenuItem onClick={() => setQuizDialogOpen(true)}>
                <HelpCircle className="h-4 w-4 mr-2" />
                {existingQuiz ? "Edit Quiz" : "Create Quiz"}
              </DropdownMenuItem>
            )}
            {content.type === ContentType.ASSIGNMENT && (
              <DropdownMenuItem onClick={() => setAssignmentDialogOpen(true)}>
                <ClipboardList className="h-4 w-4 mr-2" />
                {existingAssignment ? "Edit Assignment" : "Create Assignment"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() =>
                updateContent.mutate({
                  contentId: content._id,
                  data: { isVisible: !content.isVisible },
                  lessonId,
                })
              }
            >
              {content.isVisible ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" /> Hide
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" /> Show
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                updateContent.mutate({
                  contentId: content._id,
                  data: { isPreview: !content.isPreview },
                  lessonId,
                })
              }
            >
              {content.isPreview ? (
                <>
                  <Eye className="h-4 w-4 mr-2" /> Remove Preview
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" /> Set Preview
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
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
              Update details or replace the file.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marks</Label>
                <Input
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

            {getCurrentFileUrl() && !newFileKey && (
              <div className="space-y-2">
                <Label>Current File</Label>
                <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground truncate">
                  {getCurrentFileUrl()}
                </div>
              </div>
            )}

            {(content.type === ContentType.VIDEO ||
              content.type === ContentType.AUDIO ||
              content.type === ContentType.PDF) && (
              <div className="space-y-4"></div>
            )}

            {(content.type === ContentType.VIDEO ||
              content.type === ContentType.AUDIO) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (seconds)</Label>
                  <Input
                    type="number"
                    min={10}
                    value={editDuration}
                    onChange={(e) => setEditDuration(+e.target.value || 10)}
                    disabled={isDurationAutoCalculated && editDuration > 0}
                  />
                </div>
                {content.type === ContentType.VIDEO && (
                  <div className="space-y-2">
                    <Label>Min Watch %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={editMinWatchPercent}
                      onChange={(e) =>
                        setEditMinWatchPercent(+e.target.value || 90)
                      }
                    />
                  </div>
                )}
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
              {isLoading ? (
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

      {/* Delete & Other Dialogs */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {content.title}? This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
