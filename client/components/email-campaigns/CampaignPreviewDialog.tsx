"use client";

import { useGetCampaign } from "@/services/campaigns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Users, Clock, AlertCircle } from "lucide-react";

interface CampaignPreviewDialogProps {
  campaignId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignPreviewDialog({
  campaignId,
  open,
  onOpenChange,
}: CampaignPreviewDialogProps) {
  const { data, isLoading } = useGetCampaign(
    campaignId || "",
    !!campaignId && open,
  );

  const campaign = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Campaign Preview</DialogTitle>
          <DialogDescription>
            Preview how your email campaign will look to recipients
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : campaign ? (
          <div className="space-y-6">
            {/* Campaign Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Subject</span>
                </div>
                <p className="font-medium">{campaign.subject}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Recipients</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{campaign.recipientType}</Badge>
                  <span className="text-sm text-muted-foreground">
                    ~{campaign.metadata.estimatedRecipients} users
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Priority</span>
                </div>
                <Badge
                  className={
                    campaign.priority.toLowerCase() === "high"
                      ? "bg-red-500"
                      : campaign.priority.toLowerCase() === "medium"
                        ? "bg-yellow-500"
                        : campaign.priority.toLowerCase() === "low"
                          ? "bg-green-500"
                          : "bg-gray-500"
                  }
                >
                  {campaign.priority}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>Status</span>
                </div>
                <Badge
                  className={
                    campaign.status.toLowerCase() === "completed"
                      ? "bg-green-500"
                      : campaign.status.toLowerCase() === "failed"
                        ? "bg-red-500"
                        : campaign.status.toLowerCase() === "draft"
                          ? "bg-yellow-500"
                          : campaign.status.toLowerCase() === "scheduled"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                  }
                >
                  {campaign.status}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Email Preview */}
            <div>
              <h3 className="text-sm font-medium mb-3">
                Email Content Preview
              </h3>
              <div className="rounded-lg border  p-6">
                {/* Email Header */}
                <div className="mb-4 pb-4 border-b">
                  <div className="text-sm text-muted-foreground mb-1">
                    From: EduApp Marketing
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    To: Recipients
                  </div>
                  <div className="font-semibold text-lg mt-2">
                    {campaign.subject}
                  </div>
                </div>

                {/* Email Body */}
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: campaign.content }}
                />
              </div>
            </div>

            {/* Warning Message */}
            {campaign.status === "draft" && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900">Note</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Only users who have opted into marketing emails will
                      receive this campaign. Users who have not verified their
                      email will also be excluded.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Stats (if sent) */}
            {campaign.status !== "draft" && campaign.status !== "scheduled" && (
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-3">Delivery Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {campaign.sentCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Sent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {campaign.failedCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {campaign.metadata.actualRecipients ||
                        campaign.metadata.estimatedRecipients}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Recipients
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Campaign not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
