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
import { useDeleteCoupon } from "@/services/courses/mutations";

interface CouponDeleteAlertProps {
  deletingCouponId: string | null;
  onClose: () => void;
}

export function CouponDeleteAlert({
  deletingCouponId,
  onClose,
}: CouponDeleteAlertProps) {
  const deleteCoupon = useDeleteCoupon();

  const handleDeleteConfirm = async () => {
    if (!deletingCouponId) return;
    try {
      await deleteCoupon.mutateAsync(deletingCouponId);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AlertDialog
      open={!!deletingCouponId}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            coupon and prevent any future use.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDeleteConfirm}
            disabled={deleteCoupon.isPending}
          >
            {deleteCoupon.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
