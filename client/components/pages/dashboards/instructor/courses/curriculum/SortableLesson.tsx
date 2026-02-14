"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Badge } from "@/components/ui/badge";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  PlayCircle,
  FileText,
  File,
  Headphones,
  Lock,
  Unlock,
} from "lucide-react";

import {
  useGetContentsByLesson,
  useUpdateLesson,
  useDeleteLesson,
  useReorderContents,
  ILesson,
  ILessonContent,
  ContentType,
} from "@/services/courses";
import apiClient from "@/lib/api/axios";
import { LessonDialog } from "./LessonDialog";
import { SortableContentItem } from "./SortableContentItem";
import { ContentDialog } from "./ContentAddDialog";

interface SortableLessonProps {
  lesson: ILesson;
  index: number;
  sectionId: string;
  courseId: string;
}

const contentTypeIcons: Record<ContentType, React.ReactNode> = {
  [ContentType.VIDEO]: <PlayCircle className="h-4 w-4" />,
  [ContentType.PDF]: <FileText className="h-4 w-4" />,
  [ContentType.TEXT]: <File className="h-4 w-4" />,
  [ContentType.QUIZ]: <FileText className="h-4 w-4" />,
  [ContentType.ASSIGNMENT]: <File className="h-4 w-4" />,
  [ContentType.AUDIO]: <Headphones className="h-4 w-4" />,
};

export function SortableLesson({
  lesson,
  index,
  sectionId,
  courseId,
}: SortableLessonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [localContents, setLocalContents] = useState<ILessonContent[] | null>(
    null,
  );
  const [lastDataKey, setLastDataKey] = useState<string>("");

  const { data: contentsData } = useGetContentsByLesson(lesson._id);
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const reorderContents = useReorderContents();

  // Use API data directly, only use local state when reordering
  const apiContents = contentsData?.data || [];

  // Create a key from API data to detect changes
  const currentDataKey = apiContents
    .map((c: ILessonContent) => `${c._id}-${c.order}`)
    .join(",");

  // Reset local state when API data changes
  if (currentDataKey !== lastDataKey && localContents !== null) {
    setLocalContents(null);
    setLastDataKey(currentDataKey);
  } else if (currentDataKey !== lastDataKey) {
    setLastDataKey(currentDataKey);
  }

  const contents = localContents ?? apiContents;

  // DnD sensors for content reordering
  const contentSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleContentDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = contents.findIndex(
      (c: ILessonContent) => c._id === active.id,
    );
    const newIndex = contents.findIndex(
      (c: ILessonContent) => c._id === over.id,
    );

    const newContents = arrayMove(contents, oldIndex, newIndex);
    setLocalContents(newContents as ILessonContent[]);

    const reorderData = newContents.map((content: ILessonContent, idx) => ({
      id: content._id,
      order: idx,
    }));

    reorderContents.mutate({ lessonId: lesson._id, items: reorderData });
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUpdateLesson = async (data: {
    title: string;
    description?: string;
    deadline?: {
      dueDate?: string;
      startDate?: string;
      penaltyPercent?: number;
    };
  }) => {
    try {
      await updateLesson.mutateAsync({
        lessonId: lesson._id,
        data: {
          title: data.title,
          isVisible: lesson.isVisible,
          deadline: data.deadline,
        },
        sectionId,
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating lesson:", error);
    }
  };

  const handleDeleteLesson = async () => {
    try {
      await deleteLesson.mutateAsync({ lessonId: lesson._id, sectionId });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting lesson:", error);
    }
  };

  const handleToggleVisibility = () => {
    updateLesson.mutate({
      lessonId: lesson._id,
      data: { isVisible: !lesson.isVisible },
      sectionId,
    });
  };

  const handleToggleUnlock = async () => {
    try {
      await apiClient.put(
        `/classroom/${courseId}/lesson/${lesson._id}/unlock`,
        {
          unlock: !(lesson as any).isManuallyUnlocked,
        },
      );
      window.location.reload();
    } catch (error) {
      console.error("Error toggling lesson lock:", error);
    }
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="border rounded-md bg-card">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center gap-2 p-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab hover:bg-muted p-1 rounded"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>

            <CollapsibleTrigger asChild>
              <button className="flex items-center cursor-pointer gap-2 flex-1 text-left text-sm">
                {isOpen ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                <span>
                  Lesson {index + 1}: {lesson.title}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {contents.length} items
                </Badge>
                {!lesson.isVisible && (
                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setContentDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Lesson
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleVisibility}>
                  {lesson.isVisible ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Lesson
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Lesson
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleUnlock}>
                  {(lesson as any).isManuallyUnlocked ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Lock Lesson
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlock Lesson
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Lesson
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
            <div className="px-8 pb-2 space-y-1">
              {contents.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <p>No content yet</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1"
                    onClick={() => setContentDialogOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Content
                  </Button>
                </div>
              ) : (
                <DndContext
                  sensors={contentSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleContentDragEnd}
                >
                  <SortableContext
                    items={contents.map((c: ILessonContent) => c._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {contents.map((content: ILessonContent) => (
                      <SortableContentItem
                        key={content._id}
                        content={content}
                        lessonId={lesson._id}
                        courseId={courseId}
                        icon={contentTypeIcons[content.type]}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Edit Lesson Dialog */}
      <LessonDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleUpdateLesson}
        isLoading={updateLesson.isPending}
        initialData={{
          title: lesson.title,
          deadline: lesson.deadline,
        }}
        mode="edit"
      />

      {/* Content Dialog */}
      <ContentDialog
        open={contentDialogOpen}
        onOpenChange={setContentDialogOpen}
        lessonId={lesson._id}
        courseId={courseId}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{lesson.title}&quot;? This
              will also delete all content within this lesson. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
