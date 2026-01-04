"use client";

import { useState } from "react";
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
import { SortableLesson } from "./SortableLesson";
import { SectionDialog } from "./SectionDialog";
import { LessonDialog } from "./LessonDialog";


interface SortableSectionProps {
    section: ISection;
    index: number;
    courseId: string;
}

export function SortableSection({ section, index, courseId }: SortableSectionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
    const [lessons, setLessons] = useState<ILesson[]>([]);

    const { data: lessonsData } = useGetLessonsBySection(section._id);
    const updateSection = useUpdateSection();
    const deleteSection = useDeleteSection();
    const reorderLessons = useReorderLessons();
    const createLesson = useCreateLesson();

    // API returns data as array directly
    const apiLessons = lessonsData?.data || [];
    if (apiLessons.length > 0 && lessons.length === 0) {
        setLessons(apiLessons);
    }

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
        })
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

    const handleCreateLesson = async (data: { title: string; description?: string }) => {
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
            <div
                ref={setNodeRef}
                style={style}
                className="border rounded-lg bg-card"
            >
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
                            <button className="flex items-center gap-2 flex-1 text-left">
                                {isOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                                <span className="font-medium">
                                    Section {index + 1}: {section.title}
                                </span>
                                <span className="text-sm text-muted-foreground ml-2">
                                    ({lessons.length} lessons)
                                </span>
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

                    <CollapsibleContent>
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
                            Are you sure you want to delete &quot;{section.title}&quot;? This will also delete all lessons and content within this section. This action cannot be undone.
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
        </>
    );
}
