import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  CheckCircle2,
  Clock,
  Copy,
  Edit,
  MoreVertical,
  Ticket,
  Trash,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { CouponStatus, CouponType, ICourseCoupon } from "@/services/courses";

interface CouponTableProps {
  coupons: ICourseCoupon[];
  isLoading: boolean;
  onEdit: (coupon: ICourseCoupon) => void;
  onDeleteRequest: (id: string) => void;
}

export function CouponTable({
  coupons,
  isLoading,
  onEdit,
  onDeleteRequest,
}: CouponTableProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Coupon code copied to clipboard.");
  };

  if (isLoading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Loading coupons...
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
        <Ticket className="h-8 w-8 mx-auto mb-3 opacity-50" />
        <p>No coupons created for this course yet.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uses</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon: ICourseCoupon) => (
            <TableRow key={coupon._id}>
              <TableCell className="font-medium whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono bg-background">
                    {coupon.code}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.preventDefault();
                      copyToClipboard(coupon.code);
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                {coupon.type === CouponType.PERCENTAGE
                  ? `${coupon.discountValue}%`
                  : `₹${coupon.discountValue}`}
              </TableCell>
              <TableCell>
                {coupon.status === CouponStatus.ACTIVE && (
                  <Badge
                    variant="default"
                    className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                  </Badge>
                )}
                {coupon.status === CouponStatus.EXPIRED && (
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" /> Expired
                  </Badge>
                )}
                {(coupon.status === CouponStatus.EXHAUSTED ||
                  coupon.usageLimit === coupon.timesUsed) && (
                  <Badge
                    variant="default"
                    className="mx-2 border border-red-800/25 text-amber-50 bg-red-500/10"
                  >
                    <XCircle className="w-3 h-3 mr-1" /> Code exhausted
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {coupon.timesUsed}{" "}
                {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "(Unlimited)"}
              </TableCell>
              <TableCell>
                {format(new Date(coupon.endDate), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => copyToClipboard(coupon.code)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(coupon)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteRequest(coupon._id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
