"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { UserActionsMenu } from "../UserActionsMenu";
import { UserRow } from "../../types";

/* ----------------------------- Types ----------------------------- */

type Pagination = {
  hasPrev: boolean;
  hasNext: boolean;
};

type UserPageContentProps = {
  tableBodyRef: React.RefObject<HTMLTableSectionElement | null>;

  rows?: UserRow[];

  pagination: Pagination;

  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;

  pageInfo: {
    fromItem: number;
    toItem: number;
    totalItems: number;
  };

  limit: number;
  setLimit: (n: number) => void;

  onPrev: () => void;
  onNext: () => void;
};

/* ---------------------------- Component --------------------------- */

function UserPageContent({
  tableBodyRef,
  rows,
  pagination,
  isLoading,
  isError,
  error,
  pageInfo,
  limit,
  setLimit,
  onPrev,
  onNext,
}: UserPageContentProps) {
  const perPageOptions = [5, 10, 25, 50];

  const handleLimitChange = (value: string) => {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      setLimit(parsed);
    }
  };

  return (
    <CardContent className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Last Active</TableHead>
            {<TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody ref={tableBodyRef}>
          {/* Loading */}
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={`sk-${i}`}>
                <TableCell colSpan={5}>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}

          {/* Error */}
          {isError && (
            <TableRow>
              <TableCell colSpan={5}>
                <p className="text-center text-sm text-destructive">
                  {error?.message || "Failed to load users"}
                </p>
              </TableCell>
            </TableRow>
          )}

          {/* Rows */}
          {!isLoading &&
            !isError &&
            rows?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 text-sm">
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((c) => c[0])
                          .slice(0, 2)
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-medium leading-none">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="secondary">{user.roleLabel}</Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    className={cn("text-xs font-medium", user.status.className)}
                  >
                    {user.status.label}
                  </Badge>
                </TableCell>

                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                  {user.lastActive}
                </TableCell>

                {
                  <TableCell className="text-right">
                    <UserActionsMenu user={user} onView={() => {}} />
                  </TableCell>
                }
              </TableRow>
            ))}

          {/* Empty */}
          {!isLoading && !isError && (!rows || rows.length === 0) && (
            <TableRow>
              <TableCell colSpan={5}>
                <p className="text-center text-sm text-muted-foreground">
                  No users match the current filters.
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      <div className="flex flex-col gap-3 border-t pt-4 text-sm md:flex-row md:items-center md:justify-between">
        <p className="text-muted-foreground">
          {pageInfo.totalItems === 0
            ? "No records to display"
            : `Showing ${pageInfo.fromItem}–${pageInfo.toItem} of ${pageInfo.totalItems}`}
        </p>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Rows per page</span>

            <Select value={String(limit)} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {perPageOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={!pagination.hasPrev || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={!pagination.hasNext || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  );
}

export default UserPageContent;
