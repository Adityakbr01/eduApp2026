"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Leaf, MoreHorizontal } from "lucide-react";

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
} from "@/components/ui/dropdown-menu";

import { useGetCoursesForAdmin } from "@/services/courses/queries";
import { useAdminReviewCourseRequest } from "@/services/courses/mutations";
import { AdminCourse, CourseStatus } from "@/services/courses";

export default function AdminCoursesPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  /* ----------------------------- reject dialog ----------------------------- */
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );

  /* ----------------------------- view course dialog ----------------------------- */
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(
    null
  );

  /* ----------------------------- queries ----------------------------- */
  const { data, isLoading, isError } = useGetCoursesForAdmin({ page, limit });

  const { mutate: reviewRequest, isPending } = useAdminReviewCourseRequest();

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

  const courses = data?.data.courses ?? [];
  const pagination = data?.data.pagination;

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
              <TableHead>Request Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-center">
                Action <Leaf className="inline ml-1 text-green-600" />
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {courses.map((course) => (
              <TableRow key={course._id}>
                <TableCell className="font-medium">{course.title}</TableCell>

                <TableCell>{course.category?.name}</TableCell>

                <TableCell>
                  <p>{course.instructor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {course.instructor.email}
                  </p>
                </TableCell>

                <TableCell>
                  <Badge variant={course.isPublished ? "default" : "secondary"}>
                    {course.status}
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
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleViewCourse(course)}
                      >
                        View Course
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}

            {!courses.length && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
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
