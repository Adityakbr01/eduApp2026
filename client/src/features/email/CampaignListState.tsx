"use client";

import { Button } from "@/components/ui/button";
import { MailIcon } from "@/components/ui/mail-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, RefreshCw, XCircle } from "lucide-react";

interface CampaignListStateProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  searchQuery: string;
  onRetry: () => void;
  onCreate: () => void;
}

export function CampaignListState({
  isLoading,
  isError,
  isEmpty,
  searchQuery,
  onRetry,
  onCreate,
}: CampaignListStateProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl border"
          >
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-10 w-10 mx-auto text-red-400 mb-3" />
        <p className="font-medium mb-2">Failed to load campaigns</p>
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="text-center py-14">
        <MailIcon className="h-10 w-10 mx-auto text-primary mb-4" />
        <p className="font-semibold mb-2">
          {searchQuery ? "No campaigns found" : "No campaigns yet"}
        </p>
        <p className="text-sm text-muted-foreground mb-5 px-4">
          {searchQuery
            ? "Try adjusting your search or filters"
            : "Create your first email campaign and reach your audience"}
        </p>

        {!searchQuery && (
          <Button onClick={onCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Campaign
          </Button>
        )}
      </div>
    );
  }

  return null;
}
