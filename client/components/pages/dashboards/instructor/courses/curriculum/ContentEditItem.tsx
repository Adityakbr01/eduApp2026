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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDuration } from "@/lib/utils/formatDuration";
import getCurrentFileUrl from "@/lib/utils/getCurrentFileUrl";
import {
  useAssignmentByContentId,
  useQuizByContentId,
} from "@/services/assessments";
import {
  ContentType,
  ILessonContent,
  useDeleteContent,
  useUpdateContent,
  VideoStatusEnum,
} from "@/services/courses";
import {
  ClipboardList,
  Clock,
  Eye,
  EyeOff,
  HelpCircle,
  MoreVertical,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { AssignmentDialog } from "./AssignmentDialog";
import { EditContentDialog } from "./ContentEditDialog";
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

export function ContentItem({
  content,
  lessonId,
  courseId,
  icon,
}: ContentItemProps) {
  const video = content.video;

  const [videoStatus, setVideoStatus] = useState<VideoStatusEnum | null>(
    video?.status ?? null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [newFileKey, setNewFileKey] = useState<string | null>(null);
  const isVideoUploadDisabled =
    videoStatus?.toUpperCase() === VideoStatusEnum.UPLOADED.toUpperCase() ||
    videoStatus?.toUpperCase() === VideoStatusEnum.PROCESSING.toUpperCase();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);

  // Edit state removed - managed by Dialog

  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();

  const { data: existingQuiz } = useQuizByContentId(
    content._id,
    content.type === ContentType.QUIZ,
  );
  const { data: existingAssignment } = useAssignmentByContentId(
    content._id,
    content.type === ContentType.ASSIGNMENT,
  );

  const handleEditOpen = () => {
    setEditDialogOpen(true);
  };

  // handleEditSave removed

  const handleDelete = async () => {
    try {
      await deleteContent.mutateAsync({ contentId: content._id, lessonId });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting content:", error);
    }
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
              content.video?.duration || content.audio?.duration || 0,
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

      <EditContentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        content={content}
        courseId={courseId}
        lessonId={lessonId}
        getCurrentFileUrl={() => getCurrentFileUrl({ content })}
      />

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
          totalMarks={content.marks}
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
