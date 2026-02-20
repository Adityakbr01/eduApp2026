import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
} from "@dnd-kit/core";

import type { SensorDescriptor } from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { BookOpen, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ISection } from "@/services/courses";
import { SortableSection } from "./SortableSection";

interface CurriculumCardProps {
  sections: ISection[];
  sensors: SensorDescriptor<any>[];

  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  activeSection: ISection | null;
  setIsDialogOpen: (open: boolean) => void;
  courseId: string;
}

function CurriculumCard({
  sections,
  sensors,
  handleDragStart,
  handleDragEnd,
  activeSection,
  setIsDialogOpen,
  courseId,
}: CurriculumCardProps) {
  return (
    <Card>
      {/* Header */}
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <BookOpen className="h-5 w-5" />
          Sections & Lessons
        </CardTitle>
      </CardHeader>

      {/* Content */}
      <CardContent className="px-4 sm:px-6">
        {sections.length === 0 ? (
          /* Empty State */
          <div className="text-center py-10 sm:py-12 text-muted-foreground">
            <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />

            <p className="font-medium">No sections yet</p>
            <p className="text-sm max-w-xs mx-auto">
              Add your first section to start building the curriculum
            </p>

            <Button
              className="mt-4 w-full sm:w-auto"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Section
            </Button>
          </div>
        ) : (
          /* Sections List */
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
              <div className="space-y-3 sm:space-y-4">
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

            {/* Drag Overlay */}
            <DragOverlay>
              {activeSection ? (
                <div className="bg-card border rounded-lg p-3 sm:p-4 shadow-lg max-w-[260px]">
                  <span className="font-medium truncate block">
                    {activeSection.title}
                  </span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}

export default CurriculumCard;
