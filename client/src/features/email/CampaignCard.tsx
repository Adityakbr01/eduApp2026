"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CampaignStatus, type IEmailCampaign } from "@/services/campaigns";
import { formatDistanceToNow } from "date-fns";
import {
  Ban,
  Clock,
  Eye,
  Mail,
  MoreVertical,
  Send,
  CalendarClock,
  Target,
  Trash2,
} from "lucide-react";
import statusConfig from "./statusConfig";
import priorityConfig from "./priorityConfig";

// Campaign Card Component
interface CampaignCardProps {
  campaign: IEmailCampaign;
  onPreview: () => void;
  onSend: () => void;
  onScheduleClick: () => void;
  onCancel: () => void;
  onDelete: () => void;
  isSending: boolean;
  isCancelling: boolean;
}

function CampaignCard({
  campaign,
  onPreview,
  onSend,
  onScheduleClick,
  onCancel,
  onDelete,
  isSending,
  isCancelling,
}: CampaignCardProps) {
  const status = statusConfig[campaign.status];
  const priority = priorityConfig[campaign.priority];

  const canSend = campaign.status === CampaignStatus.DRAFT;
  const canCancel =
    campaign.status === CampaignStatus.SCHEDULED ||
    campaign.status === CampaignStatus.PROCESSING;
  const canDelete = [
    CampaignStatus.DRAFT,
    CampaignStatus.COMPLETED,
    CampaignStatus.CANCELLED,
    CampaignStatus.FAILED,
  ].includes(campaign.status);

  const deliveryRate = campaign.metadata.actualRecipients
    ? ((campaign.sentCount / campaign.metadata.actualRecipients) * 100).toFixed(
        0,
      )
    : "0";

  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors">
      {/* Icon */}
      <div
        className={`h-12 w-12 rounded-xl ${status.bg} flex items-center justify-center shrink-0`}
      >
        <Mail className={`h-5 w-5 ${status.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="font-semibold truncate">{campaign.title}</h3>
          <Badge
            variant="outline"
            className={`shrink-0 gap-1 ${priority.color} ${priority.bg} border-0 text-[10px] px-1.5`}
          >
            {priority.icon}
            {campaign.priority}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate mb-2">
          {campaign.subject}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span className="capitalize">{campaign.recipientType}</span>
            <span className="text-muted-foreground/60">
              (
              {campaign.metadata.actualRecipients ||
                campaign.metadata.estimatedRecipients}{" "}
              recipients)
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(campaign.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between gap-4 sm:gap-6">
        {/* Delivery Stats */}
        {campaign.status === CampaignStatus.COMPLETED && (
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-emerald-600 font-semibold">
                {campaign.sentCount}
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">
                {campaign.metadata.actualRecipients ||
                  campaign.metadata.estimatedRecipients}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {deliveryRate}% delivered
            </span>
          </div>
        )}

        {/* Status Badge */}
        <Badge
          variant="outline"
          className={`gap-1.5 ${status.color} ${status.bg} border-0`}
        >
          {status.icon}
          {status.label}
        </Badge>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onPreview}>
              <Eye className="mr-2 h-4 w-4" />
              Preview Campaign
            </DropdownMenuItem>

            {canSend && (
              <>
                <DropdownMenuItem onClick={onSend} disabled={isSending}>
                  <Send className="mr-2 h-4 w-4" />
                  {isSending ? "Sending..." : "Send Now"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onScheduleClick}>
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Schedule Campaign
                </DropdownMenuItem>
              </>
            )}

            {canCancel && (
              <DropdownMenuItem onClick={onCancel} disabled={isCancelling}>
                <Ban className="mr-2 h-4 w-4" />
                {isCancelling ? "Cancelling..." : "Cancel Campaign"}
              </DropdownMenuItem>
            )}

            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Campaign
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default CampaignCard;
