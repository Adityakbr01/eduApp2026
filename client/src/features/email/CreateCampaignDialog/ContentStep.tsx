"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CreateCampaignDTO } from "@/services/campaigns";
import { Lightbulb, Loader2, RefreshCw } from "lucide-react";

interface ContentStepProps {
  formData: CreateCampaignDTO;
  setFormData: React.Dispatch<React.SetStateAction<CreateCampaignDTO>>;
  isLoadingSuggestions: boolean;
  handleGetSuggestions: () => void;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  suggestions: string[];
  isGenerating: boolean;
  handleGenerateWithAI: () => void;
  isMobile: boolean;
}

export function ContentStep({
  formData,
  setFormData,
  isLoadingSuggestions,
  handleGetSuggestions,
  showSuggestions,
  setShowSuggestions,
  suggestions,
  isGenerating,
  handleGenerateWithAI,
  isMobile,
}: ContentStepProps) {
  return (
    <div className="space-y-4">
      {/* Subject */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="subject-edit" className="text-xs sm:text-sm">
            Email Subject *
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGetSuggestions}
            disabled={isLoadingSuggestions || !formData.content}
            className="h-7 text-xs"
          >
            {isLoadingSuggestions ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Lightbulb className="h-3.5 w-3.5" />
            )}
            <span className="ml-1 hidden sm:inline">Get suggestions</span>
          </Button>
        </div>
        <Input
          id="subject-edit"
          placeholder="Enter email subject"
          value={formData.subject}
          onChange={(e) =>
            setFormData({ ...formData, subject: e.target.value })
          }
          required
          className="h-9 sm:h-10 text-xs sm:text-sm"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="rounded-lg border p-2 sm:p-3 space-y-2 bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground">
              AI Suggestions:
            </p>
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full text-left text-xs sm:text-sm px-2 py-1.5 rounded hover:bg-primary/10 transition-colors"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, subject: suggestion }));
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="content" className="text-xs sm:text-sm">
            Email Content (HTML) *
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
            className="h-7 text-xs"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isGenerating && "animate-spin")}
            />
            <span className="ml-1 hidden sm:inline">Regenerate</span>
          </Button>
        </div>
        <Textarea
          id="content"
          placeholder="<h1>Hello!</h1><p>Welcome to our platform...</p>"
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          rows={isMobile ? 8 : 12}
          required
          className="font-mono text-xs sm:text-sm resize-none"
        />
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          Use HTML to format your email.
        </p>
      </div>
    </div>
  );
}
