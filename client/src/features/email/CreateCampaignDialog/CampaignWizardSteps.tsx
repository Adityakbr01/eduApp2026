"use client";

import { cn } from "@/lib/utils";
import { STEPS, WizardStep } from "@/services/ai";
import { Check, ChevronRight } from "lucide-react";

interface CampaignWizardStepsProps {
  currentStep: WizardStep;
  goToStep: (step: WizardStep) => void;
  canProceedToContent: boolean;
  canProceedToReview: boolean;
}

export function CampaignWizardSteps({
  currentStep,
  goToStep,
  canProceedToContent,
  canProceedToReview,
}: CampaignWizardStepsProps) {
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="px-4 sm:px-6 pt-4 shrink-0">
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4 px-2">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = index < currentStepIndex;
          const isClickable =
            index === 0 ||
            (index === 1 && canProceedToContent) ||
            (index === 2 && canProceedToReview);

          return (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => isClickable && goToStep(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
                  isActive && "bg-primary text-primary-foreground shadow-sm",
                  isCompleted &&
                    !isActive &&
                    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                  !isActive &&
                    !isCompleted &&
                    isClickable &&
                    "bg-muted text-muted-foreground hover:bg-muted/80",
                  !isActive &&
                    !isCompleted &&
                    !isClickable &&
                    "bg-muted/50 text-muted-foreground/50 cursor-not-allowed",
                )}
              >
                {isCompleted && !isActive ? (
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.shortLabel}</span>
              </button>
              {index < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
