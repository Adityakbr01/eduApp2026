"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { TONES } from "@/constants/EMAIL_CAMPAGN_CONST";
import { cn } from "@/lib/utils";
import { CAMPAIGN_TYPES, type CampaignType, type EmailTone } from "@/services/ai";
import {
  CampaignPriority,
  RecipientType,
  type CreateCampaignDTO,
} from "@/services/campaigns";
import { ChevronDown, Plus, Wand2, X } from "lucide-react";



interface AISettingStepProps {
  aiSectionOpen: boolean;
  setAiSectionOpen: (open: boolean) => void;
  aiSettings: {
    campaignType: CampaignType;
    tone: EmailTone;
    keyPoints: string[];
    additionalContext: string;
  };
  setAiSettings: React.Dispatch<
    React.SetStateAction<{
      campaignType: CampaignType;
      tone: EmailTone;
      keyPoints: string[];
      additionalContext: string;
    }>
  >;

  formData: CreateCampaignDTO;
  setFormData: React.Dispatch<React.SetStateAction<CreateCampaignDTO>>;
  isMobile: boolean;
  newKeyPoint: string;
  setNewKeyPoint: React.Dispatch<React.SetStateAction<string>>;
  addKeyPoint: () => void;
  removeKeyPoint: (index: number) => void;
}

function AISettingStep({
  aiSectionOpen,
  setAiSectionOpen,
  aiSettings,
  setAiSettings,
  formData,
  setFormData,
  isMobile,
  setNewKeyPoint,
  newKeyPoint,
  addKeyPoint,
  removeKeyPoint,
}: AISettingStepProps) {
  return (
    <div className="space-y-4">
      {/* Collapsible AI Generator */}
      <Collapsible open={aiSectionOpen} onOpenChange={setAiSectionOpen}>
        <div className="rounded-lg border bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
          <CollapsibleTrigger className="w-full p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              <h3 className="font-semibold text-sm sm:text-base">
                AI Email Generator
              </h3>
              <Badge
                variant="secondary"
                className="ml-2 text-xs hidden sm:inline-flex"
              >
                Powered by Gemini
              </Badge>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                aiSectionOpen && "rotate-180",
              )}
            />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-3 sm:px-4 pb-4 space-y-4">
              <Separator />

              {/* AI Settings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Campaign Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm">Email Type</Label>
                  <Select
                    value={aiSettings.campaignType}
                    onValueChange={(v) =>
                      setAiSettings((prev) => ({
                        ...prev,
                        campaignType: v as CampaignType,
                      }))
                    }
                  >
                    <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMPAIGN_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <span className="font-medium">{type.label}</span>
                            {!isMobile && (
                              <p className="text-xs text-muted-foreground">
                                {type.description}
                              </p>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tone */}
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm">Tone</Label>
                  <Select
                    value={aiSettings.tone}
                    onValueChange={(v) =>
                      setAiSettings((prev) => ({
                        ...prev,
                        tone: v as EmailTone,
                      }))
                    }
                  >
                    <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value}>
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Key Points */}
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm">
                  Key Points (Optional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a key point..."
                    value={newKeyPoint}
                    onChange={(e) => setNewKeyPoint(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addKeyPoint())
                    }
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addKeyPoint}
                    className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {aiSettings.keyPoints.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {aiSettings.keyPoints.map((point, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="gap-1 text-xs"
                      >
                        {point}
                        <button
                          type="button"
                          onClick={() => removeKeyPoint(index)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Context - Hidden on mobile by default */}
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm">
                  Additional Context (Optional)
                </Label>
                <Textarea
                  placeholder="Any specific details, offers, dates..."
                  value={aiSettings.additionalContext}
                  onChange={(e) =>
                    setAiSettings((prev) => ({
                      ...prev,
                      additionalContext: e.target.value,
                    }))
                  }
                  rows={isMobile ? 2 : 3}
                  className="text-xs sm:text-sm resize-none"
                />
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <Separator />

      {/* Basic Settings */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm sm:text-base">Campaign Settings</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs sm:text-sm">
              Campaign Title *
            </Label>
            <Input
              id="title"
              placeholder="Internal name for this campaign"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="h-9 sm:h-10 text-xs sm:text-sm"
            />
          </div>

          {/* Recipients */}
          <div className="space-y-1.5">
            <Label htmlFor="recipientType" className="text-xs sm:text-sm">
              Recipients *
            </Label>
            <Select
              value={formData.recipientType}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  recipientType: value as RecipientType,
                })
              }
            >
              <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RecipientType.ALL}>All Users</SelectItem>
                <SelectItem value={RecipientType.STUDENTS}>
                  Students Only
                </SelectItem>
                <SelectItem value={RecipientType.INSTRUCTORS}>
                  Instructors Only
                </SelectItem>
                <SelectItem value={RecipientType.MANAGERS}>
                  Managers Only
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label htmlFor="priority" className="text-xs sm:text-sm">
              Priority
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  priority: value as CampaignPriority,
                })
              }
            >
              <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CampaignPriority.LOW}>Low</SelectItem>
                <SelectItem value={CampaignPriority.NORMAL}>Normal</SelectItem>
                <SelectItem value={CampaignPriority.HIGH}>High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject (optional before generation) */}
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-xs sm:text-sm">
              Subject Line (Optional)
            </Label>
            <Input
              id="subject"
              placeholder="Leave empty to auto-generate"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="h-9 sm:h-10 text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AISettingStep;
