"use client";

import { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

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
  Lock,
  Unlock,
} from "lucide-react";

import {
  useGetLessonsBySection,
  useUpdateSection,
  useDeleteSection,
  useReorderLessons,
  useCreateLesson,
  ISection,
  ILesson,
} from "@/services/courses";
import apiClient from "@/lib/api/axios";
import { QUERY_KEYS } from "@/config/query-keys";
import { SortableLesson } from "./SortableLesson";
import { SectionDialog } from "./SectionDialog";
import { LessonDialog } from "./LessonDialog";

interface SortableSectionProps {
  section: ISection;
  index: number;
  courseId: string;
}

export function SortableSection({
  section,
  index,
  courseId,
}: SortableSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessons, setLessons] = useState<ILesson[]>([]);

  const queryClient = useQueryClient();
  const { data: lessonsData } = useGetLessonsBySection(section._id);
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const reorderLessons = useReorderLessons();
  const createLesson = useCreateLesson();

  // API returns data as array directly
  const apiLessons = lessonsData?.data || [];

  // Update local state when API data changes
  useEffect(() => {
    if (apiLessons.length > 0) {
      setLessons(apiLessons);
    }
  }, [lessonsData]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((l) => l._id === active.id);
    const newIndex = lessons.findIndex((l) => l._id === over.id);

    const newLessons = arrayMove(lessons, oldIndex, newIndex);
    setLessons(newLessons);

    const reorderData = newLessons.map((lesson, idx) => ({
      id: lesson._id,
      order: idx,
    }));

    reorderLessons.mutate({ sectionId: section._id, items: reorderData });
  };

  const handleUpdateSection = async (title: string) => {
    try {
      await updateSection.mutateAsync({
        sectionId: section._id,
        data: { title },
        courseId,
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating section:", error);
    }
  };

  const handleDeleteSection = async () => {
    try {
      await deleteSection.mutateAsync({ sectionId: section._id, courseId });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting section:", error);
    }
  };

  const handleToggleVisibility = () => {
    updateSection.mutate({
      sectionId: section._id,
      data: { isVisible: !section.isVisible },
      courseId,
    });
  };

  const handleToggleUnlock = async (lessonUnlock: boolean) => {
    try {
      await apiClient.put(
        `/classroom/${courseId}/section/${section._id}/unlock`,
        {
          unlock: !(section as any).isManuallyUnlocked,
          lessonUnlock,
        },
      );
      setUnlockDialogOpen(false);

      const newStatus = !(section as any).isManuallyUnlocked;
      toast.success(
        `Section ${newStatus ? "unlocked" : "locked"} successfully`,
      );

      // Invalidate queries to refresh data without reload
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.COURSES.SECTIONS(courseId)],
      });
    } catch (error) {
      console.error("Error toggling section lock:", error);
      toast.error("Failed to update section lock status");
    }
  };

  const handleCreateLesson = async (data: {
    title: string;
    description?: string;
    deadline?: {
      dueDate?: string;
      startDate?: string;
      penaltyPercent?: number;
    };
  }) => {
    try {
      await createLesson.mutateAsync({
        sectionId: section._id,
        data: { ...data, isVisible: true },
      });
      setLessonDialogOpen(false);
    } catch (error) {
      console.error("Error creating lesson:", error);
    }
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="border rounded-lg bg-card">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-t-lg">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab hover:bg-muted p-1 rounded"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>

            <CollapsibleTrigger asChild>
              <button className="flex items-center cursor-pointer gap-2 flex-1 text-left">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <div className="flex min-w-0 flex-col sm:flex-row sm:items-center">
                  <span className="font-medium truncate max-w-full sm:max-w-none">
                    Section {index + 1}: {section.title}
                  </span>

                  <span className="text-sm text-muted-foreground sm:ml-2 shrink-0">
                    ({lessons.length} lessons)
                  </span>
                </div>

                {!section.isVisible && (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLessonDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lesson
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Section
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleVisibility}>
                  {section.isVisible ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Section
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Section
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUnlockDialogOpen(true)}>
                  {(section as any).isManuallyUnlocked ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Lock Section
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlock Section
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Section
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
            <div className="p-3 space-y-2">
              {lessons.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No lessons in this section</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setLessonDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleLessonDragEnd}
                >
                  <SortableContext
                    items={lessons.map((l) => l._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {lessons.map((lesson, idx) => (
                      <SortableLesson
                        key={lesson._id}
                        lesson={lesson}
                        index={idx}
                        sectionId={section._id}
                        courseId={courseId}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Edit Section Dialog */}
      <SectionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleUpdateSection}
        isLoading={updateSection.isPending}
        initialTitle={section.title}
        mode="edit"
      />

      {/* Lesson Dialog */}
      <LessonDialog
        open={lessonDialogOpen}
        onOpenChange={setLessonDialogOpen}
        onSubmit={handleCreateLesson}
        isLoading={createLesson.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{section.title}&quot;? This
              will also delete all lessons and content within this section. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Recursive Unlock Confirmation */}
      <AlertDialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {(section as any).isManuallyUnlocked ? "Lock" : "Unlock"} Section?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to apply this change to all lessons within this
              section relative to the new section status?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="outline" onClick={() => handleToggleUnlock(false)}>
              Just Section
            </Button>
            <Button onClick={() => handleToggleUnlock(true)}>
              Section & Lessons
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
