import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Ticket } from "lucide-react";

import { CouponScope, ICourseCoupon } from "@/services/courses";
import { useGetInstructorCoupons } from "@/services/courses/queries";

import { CouponFormDialog, CouponTable, CouponDeleteAlert } from "./components";

export function CourseCouponsSection({ courseId }: { courseId: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<ICourseCoupon | null>(
    null,
  );
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);

  const { data: couponsData, isLoading } = useGetInstructorCoupons({
    limit: 50,
  });

  // We only care about coupons related to this specific course
  const courseCoupons =
    couponsData?.data?.coupons?.filter(
      (c: ICourseCoupon) =>
        c.scope === CouponScope.SPECIFIC_COURSES &&
        c.applicableCourses?.some((course: any) =>
          typeof course === "string"
            ? course === courseId
            : course._id === courseId,
        ),
    ) || [];

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Course Coupons
          </CardTitle>
          <CardDescription>
            Create and manage discount coupons exclusively for this course.
          </CardDescription>
        </div>

        <Button
          size="sm"
          type="button"
          onClick={() => {
            setEditingCoupon(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>

        <CouponFormDialog
          courseId={courseId}
          isOpen={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingCoupon(null);
            }
          }}
          editingCoupon={editingCoupon}
          onSuccess={() => {
            setIsDialogOpen(false);
            setEditingCoupon(null);
          }}
        />

        <CouponDeleteAlert
          deletingCouponId={deletingCouponId}
          onClose={() => setDeletingCouponId(null)}
        />
      </CardHeader>

      <CardContent>
        <CouponTable
          coupons={courseCoupons}
          isLoading={isLoading}
          onEdit={(coupon) => {
            setEditingCoupon(coupon);
            setIsDialogOpen(true);
          }}
          onDeleteRequest={(id) => setDeletingCouponId(id)}
        />
      </CardContent>
    </Card>
  );
}
