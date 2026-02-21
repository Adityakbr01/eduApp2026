"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Leaf, MoreHorizontal, Star, GripVertical } from "lucide-react";
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { useGetCoursesForAdmin } from "@/services/courses/queries";
import {
  useAdminReviewCourseRequest,
  useToggleFeaturedCourse,
  useReorderCourses,
} from "@/services/courses/mutations";
import { AdminCourse, CourseStatus } from "@/services/courses";

interface SortableRowProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const SortableRow = ({ id, children, className }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
    position: isDragging ? "relative" : ("unset" as any), // Typescript hack for TableRow
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`${className} ${isDragging ? "opacity-50 bg-muted" : ""}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </TableRow>
  );
};

export default function AdminCoursesPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [localCourses, setLocalCourses] = useState<AdminCourse[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /* ----------------------------- reject dialog ----------------------------- */
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );

  /* ----------------------------- view course dialog ----------------------------- */
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(
    null,
  );

  /* ----------------------------- queries ----------------------------- */
  const { data, isLoading, isError } = useGetCoursesForAdmin({ page, limit });

  const { mutate: reviewRequest, isPending } = useAdminReviewCourseRequest();
  const { mutate: toggleFeatured, isPending: isTogglingFeatured } =
    useToggleFeaturedCourse();
  const { mutate: reorderCourses } = useReorderCourses();

  // Sync data to local state

  const courses = data?.data.courses ?? [];
  const pagination = data?.data.pagination;

  // Effect to sync courses to local state when data changes
  useEffect(() => {
    if (courses.length > 0) {
      setLocalCourses(courses);
    }
  }, [courses]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-red-500">Failed to load courses.</p>;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalCourses((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Trigger API call
        const reorderPayload = newItems.map((item, index) => ({
          id: item._id,
          order: index,
        }));
        reorderCourses(reorderPayload);

        return newItems;
      });
    }
  };

  /* ----------------------------- handlers ----------------------------- */
  const handleApprove = (requestId: string) => {
    reviewRequest({
      requestId,
      action: CourseStatus.APPROVED,
    });
  };

  const handleRejectConfirm = () => {
    if (!selectedRequestId || !rejectReason.trim()) return;

    reviewRequest({
      requestId: selectedRequestId,
      action: CourseStatus.REJECTED,
      reason: rejectReason,
    });

    setRejectOpen(false);
    setRejectReason("");
    setSelectedRequestId(null);
  };

  const handleViewCourse = (course: AdminCourse) => {
    setSelectedCourse(course);
    setViewOpen(true);
  };

  const handleToggleFeatured = (courseId: string) => {
    toggleFeatured(courseId);
  };

  return (
    <div className="space-y-6">
      {/* ----------------------------- Table ----------------------------- */}
      <div className="rounded-xl border-none bg-transparent shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Request Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-center">
                Action <Leaf className="inline ml-1 text-green-600" />
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localCourses.map((c) => c._id)}
                strategy={verticalListSortingStrategy}
              >
                {localCourses.map((course) => (
                  <SortableRow
                    key={course._id}
                    id={course._id}
                    className="cursor-grab"
                  >
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground mr-2 cursor-grab" />
                      {course.title}
                    </TableCell>

                    <TableCell>{course.category?.name}</TableCell>

                    <TableCell>
                      <p>{course.instructor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {course.instructor.email}
                      </p>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={course.isPublished ? "default" : "secondary"}
                      >
                        {course.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={course.isFeatured ? "default" : "secondary"}
                        className={
                          course.isFeatured
                            ? "bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white border-none"
                            : ""
                        }
                      >
                        <Star
                          className={`w-3 h-3 mr-1 ${course.isFeatured ? "fill-white" : ""}`}
                        />
                        {course.isFeatured ? "Featured" : "Not Featured"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {course.requestType ? (
                        <Badge variant="outline" className="capitalize">
                          {course.requestType}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(course.createdAt), "dd MMM yyyy")}
                    </TableCell>

                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {course.requestId && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleApprove(course.requestId!)}
                                disabled={isPending}
                              >
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRequestId(course.requestId!);
                                  setRejectOpen(true);
                                }}
                                disabled={isPending}
                              >
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleToggleFeatured(course._id)}
                            disabled={isTogglingFeatured}
                          >
                            <Star
                              className={`w-4 h-4 mr-2 ${course.isFeatured ? "fill-amber-500 text-amber-500" : ""}`}
                            />
                            {course.isFeatured
                              ? "Unmark as Featured"
                              : "Mark as Featured"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleViewCourse(course)}
                          >
                            View Course
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </SortableRow>
                ))}
              </SortableContext>
            </DndContext>

            {!courses.length && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  No courses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ----------------------------- Pagination ----------------------------- */}
      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ----------------------------- Reject Dialog ----------------------------- */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Course Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this course.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || isPending}
              onClick={handleRejectConfirm}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ----------------------------- View Course Dialog ----------------------------- */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
            <DialogDescription>
              Detailed information about this course.
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-2">
              <p>
                <strong>Title:</strong> {selectedCourse.title}
              </p>
              <p>
                <strong>Description:</strong> {selectedCourse.description}
              </p>
              <p>
                <strong>Category:</strong> {selectedCourse.category?.name}
              </p>
              <p>
                <strong>Instructor:</strong> {selectedCourse.instructor.name} (
                {selectedCourse.instructor.email})
              </p>
              <p>
                <strong>Status:</strong> {selectedCourse.status}
              </p>
              <p className="flex items-center gap-2">
                <strong>Featured:</strong>
                <Badge
                  variant={selectedCourse.isFeatured ? "default" : "secondary"}
                  className={
                    selectedCourse.isFeatured
                      ? "bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white border-none"
                      : ""
                  }
                >
                  <Star
                    className={`w-3 h-3 mr-1 ${selectedCourse.isFeatured ? "fill-white" : ""}`}
                  />
                  {selectedCourse.isFeatured ? "Yes" : "No"}
                </Badge>
              </p>
              {selectedCourse.requestType && (
                <p>
                  <strong>Request Type:</strong> {selectedCourse.requestType}
                </p>
              )}
              {selectedCourse.requestStatus && (
                <p>
                  <strong>Request Status:</strong>{" "}
                  {selectedCourse.requestStatus}
                </p>
              )}
              <p>
                <strong>Created At:</strong>{" "}
                {format(new Date(selectedCourse.createdAt), "dd MMM yyyy")}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
