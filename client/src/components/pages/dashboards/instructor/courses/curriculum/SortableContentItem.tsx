"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { ILessonContent } from "@/services/courses";
import { ContentItem } from "./ContentEditItem";

interface SortableContentItemProps {
  content: ILessonContent;
  lessonId: string;
  courseId: string;
  icon: React.ReactNode;
}

export function SortableContentItem({
  content,
  lessonId,
  courseId,
  icon,
}: SortableContentItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: content._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1 min-w-0 p-1 px-3"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab hover:bg-muted p-1 rounded shrink-0"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <ContentItem
          content={content}
          lessonId={lessonId}
          courseId={courseId}
          icon={icon}
        />
      </div>
    </div>
  );
}
