"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";

type WizardStep = "ai" | "content" | "review";

interface EmailCompainDialogFooterProps {
  currentStep: WizardStep;
  setCurrentStep: React.Dispatch<React.SetStateAction<WizardStep>>;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  canProceedToContent: boolean | "";
  canProceedToReview: boolean | "";
  isGenerating: boolean;
  handleGenerateWithAI: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  isMobile: boolean;
  goToStep: (step: WizardStep) => void;
}

export function EmailCompainDialogFooter({
  currentStep,
  setCurrentStep,
  onOpenChange,
  isPending,
  canProceedToContent,
  canProceedToReview,
  isGenerating,
  handleGenerateWithAI,
  handleSubmit,
  isMobile,
  goToStep,
}: EmailCompainDialogFooterProps) {
  return (
    <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t shrink-0">
      <div className="flex w-full items-center justify-between gap-2">
        {/* Left side - Back button */}
        <div>
          {currentStep !== "ai" && (
            <Button
              type="button"
              variant="ghost"
              size={isMobile ? "sm" : "default"}
              onClick={() =>
                goToStep(currentStep === "review" ? "content" : "ai")
              }
              className="text-xs sm:text-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="text-xs sm:text-sm"
          >
            Cancel
          </Button>

          {currentStep === "ai" && (
            <>
              <Button
                type="button"
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => canProceedToContent && setCurrentStep("content")}
                disabled={!canProceedToContent}
                className="text-xs sm:text-sm"
              >
                {isMobile ? "Skip" : "Write Manually"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
              <Button
                type="button"
                size={isMobile ? "sm" : "default"}
                onClick={handleGenerateWithAI}
                disabled={isGenerating || !canProceedToContent}
                className="text-xs sm:text-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 sm:mr-2 animate-spin" />
                    <span className="hidden sm:inline">Generating...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Generate with AI</span>
                    <span className="sm:hidden">Generate</span>
                  </>
                )}
              </Button>
            </>
          )}

          {currentStep === "content" && (
            <Button
              type="button"
              size={isMobile ? "sm" : "default"}
              onClick={() => setCurrentStep("review")}
              disabled={!canProceedToReview}
              className="text-xs sm:text-sm"
            >
              Review
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}

          {currentStep === "review" && (
            <Button
              size={isMobile ? "sm" : "default"}
              onClick={handleSubmit}
              disabled={isPending || !canProceedToReview}
              className="text-xs sm:text-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 sm:mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1 sm:mr-2" />
                  Create Campaign
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </DialogFooter>
  );
}
