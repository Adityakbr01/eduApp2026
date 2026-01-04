"use client";

import { useState } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
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
import { useParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, BookOpen } from "lucide-react";

import {
    useGetCourseById,
    useGetSectionsByCourse,
    useCreateSection,
    useReorderSections,
    ISection,
} from "@/services/courses";
import { SortableSection } from "./SortableSection";
import { SectionDialog } from "./SectionDialog";


export function CurriculumManager() {
    const params = useParams();
    const courseId = params.id as string;

    const { data: courseData, isLoading: courseLoading } = useGetCourseById(courseId);
    const { data: sectionsData, isLoading: sectionsLoading } = useGetSectionsByCourse(courseId);

    const createSection = useCreateSection();
    const reorderSections = useReorderSections();

    const [sections, setSections] = useState<ISection[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const course = courseData?.data

    // Sync sections from API - data is array directly
    const apiSections = sectionsData?.data || [];
    if (apiSections.length > 0 && sections.length === 0) {
        setSections(apiSections);
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id) return;

        const oldIndex = sections.findIndex((s) => s._id === active.id);
        const newIndex = sections.findIndex((s) => s._id === over.id);

        const newSections = arrayMove(sections, oldIndex, newIndex);
        setSections(newSections);

        // Send reorder request to API
        const reorderData = newSections.map((section, index) => ({
            id: section._id,
            order: index,
        }));

        reorderSections.mutate({ courseId, items: reorderData });
    };

    const handleCreateSection = async (title: string) => {
        try {
            await createSection.mutateAsync({
                courseId,
                data: { title, isVisible: true },
            });
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error creating section:", error);
        }
    };

    const activeSection = activeId ? sections.find((s) => s._id === activeId) : null;

    if (courseLoading || sectionsLoading) {
        return (
            <div className="container mx-auto py-6 max-w-4xl space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <div>
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96 mt-2" />
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container py-6 text-center">
                <p className="text-destructive">Course not found</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/Instructor">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Course Curriculum</h1>
                        <p className="text-muted-foreground">{course.title}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/Instructor/courses/${courseId}/edit`}>
                            Edit Details
                        </Link>
                    </Button>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Section
                    </Button>
                </div>
            </div>

            {/* Curriculum */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Sections & Lessons
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {sections.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No sections yet</p>
                            <p className="text-sm">Add your first section to start building the curriculum</p>
                            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add First Section
                            </Button>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={sections.map((s) => s._id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-4">
                                    {sections.map((section, index) => (
                                        <SortableSection
                                            key={section._id}
                                            section={section}
                                            index={index}
                                            courseId={courseId}
                                        />
                                    ))}
                                </div>
                            </SortableContext>

                            <DragOverlay>
                                {activeSection ? (
                                    <div className="bg-card border rounded-lg p-4 shadow-lg">
                                        <span className="font-medium">{activeSection.title}</span>
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    )}
                </CardContent>
            </Card>

            {/* Section Dialog */}
            <SectionDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleCreateSection}
                isLoading={createSection.isPending}
            />
        </div>
    );
}
