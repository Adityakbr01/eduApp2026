"use client";

import {
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus } from "lucide-react";

import {
  ISection,
  useCreateSection,
  useGetCourseById,
  useGetSectionsByCourse,
  useReorderSections,
} from "@/services/courses";
import CurriculumCard from "./CurriculumCard";
import { SectionDialog } from "./SectionDialog";

export function CurriculumManager() {
  const params = useParams();
  const courseId = params.id as string;

  const { data: courseData, isLoading: courseLoading } =
    useGetCourseById(courseId);
  const { data: sectionsData, isLoading: sectionsLoading } =
    useGetSectionsByCourse(courseId);

  const createSection = useCreateSection();
  const reorderSections = useReorderSections();

  const [sections, setSections] = useState<ISection[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const course = courseData?.data;

  // Sync sections from API - data is array directly
  const apiSections = sectionsData?.data || [];
  if (apiSections.length > 0 && sections.length === 0) {
    setSections(apiSections);
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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

  const activeSection = activeId
    ? sections.find((s) => s._id === activeId)
    : null;

  if (courseLoading || sectionsLoading) {
    return (
      <div className="px-2 mx-auto py-6 md:w-[70%] space-y-6">
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
    <div className="px-2 mx-auto py-6 md:w-[70%]">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side */}
        <div className="flex items-start gap-3 sm:items-center sm:gap-4 min-w-0">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/Instructor">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold">Course Curriculum</h1>
            <p className="text-sm text-muted-foreground truncate max-w-[220px] sm:max-w-[350px] md:max-w-[500px]">
              {course.title}
            </p>
          </div>
        </div>

        {/* Right side buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href={`/dashboard/Instructor/courses/${courseId}/edit`}>
              Edit Details
            </Link>
          </Button>

          <Button
            onClick={() => setIsDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      {/* Curriculum Card */}
      <CurriculumCard
        sections={sections}
        sensors={sensors}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
        activeSection={activeSection!}
        setIsDialogOpen={setIsDialogOpen}
        courseId={courseId}
      />

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
