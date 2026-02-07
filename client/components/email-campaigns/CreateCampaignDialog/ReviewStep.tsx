"use client";

import { Badge } from "@/components/ui/badge";
import { CreateCampaignDTO, RecipientType } from "@/services/campaigns";
import { Eye, Send } from "lucide-react";
import { EmailLivePreview } from "./EmailLivePreview";

interface ReviewStepProps {
  formData: CreateCampaignDTO;
  previewText: string;
}

export function ReviewStep({ formData, previewText }: ReviewStepProps) {
  return (
    <div className="space-y-4">
      {/* Campaign Summary */}
      <div className="rounded-lg border p-3 sm:p-4 space-y-3">
        <h4 className="font-medium text-sm sm:text-base flex items-center gap-2">
          <Send className="h-4 w-4" />
          Campaign Summary
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
          <div>
            <span className="text-muted-foreground">Title:</span>
            <span className="ml-2 font-medium">{formData.title}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Recipients:</span>
            <span className="ml-2 font-medium capitalize">
              {formData.recipientType === RecipientType.ALL
                ? "All Users"
                : formData.recipientType}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Priority:</span>
            <Badge variant="outline" className="ml-2 capitalize text-xs">
              {formData.priority}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Subject:</span>
            <span className="ml-2 font-medium truncate block">
              {formData.subject}
            </span>
          </div>
        </div>
      </div>

      {/* Email Preview */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm sm:text-base flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Email Preview
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <EmailLivePreview
            subject={formData.subject}
            content={formData.content}
            previewText={previewText}
          />
        </div>
      </div>
    </div>
  );
}
