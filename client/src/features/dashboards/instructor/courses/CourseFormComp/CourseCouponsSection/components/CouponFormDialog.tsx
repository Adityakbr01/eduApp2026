import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { useEffect } from "react";
import {
  CouponScope,
  CouponType,
  CreateCouponFormValues,
  createCouponSchema,
  ICourseCoupon,
} from "@/services/courses";
import { useCreateCoupon, useUpdateCoupon } from "@/services/courses/mutations";

interface CouponFormDialogProps {
  courseId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCoupon: ICourseCoupon | null;
  onSuccess: () => void;
}

export function CouponFormDialog({
  courseId,
  isOpen,
  onOpenChange,
  editingCoupon,
  onSuccess,
}: CouponFormDialogProps) {
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();

  const form = useForm<CreateCouponFormValues>({
    resolver: zodResolver(createCouponSchema) as any,
    defaultValues: {
      code: "",
      name: "",
      description: "",
      type: CouponType.PERCENTAGE,
      discountValue: "10",
      maxDiscountAmount: "",
      minPurchaseAmount: "",
      usageLimit: "",
      usageLimitPerUser: "1",
      firstPurchaseOnly: false,
      startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endDate: format(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        "yyyy-MM-dd'T'HH:mm",
      ),
    } as any,
  });

  useEffect(() => {
    if (editingCoupon && isOpen) {
      form.reset({
        code: editingCoupon.code,
        name: editingCoupon.name,
        description: editingCoupon.description || "",
        type: editingCoupon.type,
        discountValue: editingCoupon.discountValue.toString(),
        maxDiscountAmount: editingCoupon.maxDiscountAmount?.toString() || "",
        minPurchaseAmount: editingCoupon.minPurchaseAmount?.toString() || "",
        usageLimit: editingCoupon.usageLimit?.toString() || "",
        usageLimitPerUser: editingCoupon.usageLimitPerUser.toString(),
        firstPurchaseOnly: editingCoupon.firstPurchaseOnly,
        startDate: format(
          new Date(editingCoupon.startDate),
          "yyyy-MM-dd'T'HH:mm",
        ),
        endDate: format(new Date(editingCoupon.endDate), "yyyy-MM-dd'T'HH:mm"),
      } as any);
    } else if (!isOpen) {
      setTimeout(() => form.reset(), 200);
    }
  }, [editingCoupon, isOpen, form]);

  const onSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        discountValue: Number(values.discountValue),
        usageLimitPerUser: Number(values.usageLimitPerUser),
        maxDiscountAmount: values.maxDiscountAmount
          ? Number(values.maxDiscountAmount)
          : undefined,
        minPurchaseAmount: values.minPurchaseAmount
          ? Number(values.minPurchaseAmount)
          : undefined,
        usageLimit:
          values.usageLimit && Number(values.usageLimit) > 0
            ? Number(values.usageLimit)
            : undefined,
        description: values.description || undefined,
        scope: CouponScope.SPECIFIC_COURSES,
        applicableCourses: [courseId],
      };

      if (editingCoupon) {
        await updateCoupon.mutateAsync({
          id: editingCoupon._id,
          data: payload as any,
        });
      } else {
        await createCoupon.mutateAsync(payload as any);
      }
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
          </DialogTitle>
          <DialogDescription>
            This coupon will apply exclusively to this course.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. SUMMER2024"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Summer Sale 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CouponType.PERCENTAGE}>
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value={CouponType.FIXED_AMOUNT}>
                          Fixed Amount
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Value</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Usage Limit (0 for unlimited)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstPurchaseOnly"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>First Purchase Only</FormLabel>
                      <FormDescription>
                        Valid only for new students.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={createCoupon.isPending || updateCoupon.isPending}
              >
                {editingCoupon
                  ? updateCoupon.isPending
                    ? "Updating..."
                    : "Update Coupon"
                  : createCoupon.isPending
                    ? "Creating..."
                    : "Create Coupon"}
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
