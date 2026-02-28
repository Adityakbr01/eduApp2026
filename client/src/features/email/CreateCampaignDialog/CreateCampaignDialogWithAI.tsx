"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  STEPS,
  useGenerateEmail,
  useGetSubjectSuggestions,
  WizardStep,
  type CampaignType,
  type EmailTone,
  type TargetAudience,
} from "@/services/ai";
import {
  CampaignPriority,
  RecipientType,
  useCreateCampaign,
  type CreateCampaignDTO,
} from "@/services/campaigns";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import AISettingStep from "./AISettingStep";
import { CampaignWizardSteps } from "./CampaignWizardSteps";
import { ContentStep } from "./ContentStep";
import { EmailCompainDialogFooter } from "./EmailCompainDialogFooter";
import { ReviewStep } from "./ReviewStep";

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCampaignDialog({
  open,
  onOpenChange,
}: CreateCampaignDialogProps) {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState<WizardStep>("ai");
  const [aiSectionOpen, setAiSectionOpen] = useState(true);

  // Form data
  const [formData, setFormData] = useState<CreateCampaignDTO>({
    title: "",
    subject: "",
    content: "",
    recipientType: RecipientType.ALL,
    priority: CampaignPriority.NORMAL,
    tags: [],
  });

  // AI generation settings
  const [aiSettings, setAiSettings] = useState({
    campaignType: "newsletter" as CampaignType,
    tone: "friendly" as EmailTone,
    language: "English",
    provider: "gemini" as "gemini" | "openrouter",
    keyPoints: [] as string[],
    additionalContext: "",
  });
  const [newKeyPoint, setNewKeyPoint] = useState("");
  const [previewText, setPreviewText] = useState("");

  // Subject suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mutations
  const { mutate: createCampaign, isPending } = useCreateCampaign();
  const { mutate: generateEmail, isPending: isGenerating } = useGenerateEmail();
  const { mutate: getSuggestions, isPending: isLoadingSuggestions } =
    useGetSubjectSuggestions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createCampaign(formData, {
      onSuccess: () => {
        onOpenChange(false);
        resetForm();
      },
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      content: "",
      recipientType: RecipientType.ALL,
      priority: CampaignPriority.NORMAL,
      tags: [],
    });
    setAiSettings({
      campaignType: "newsletter",
      tone: "friendly",
      language: "English",
      provider: "gemini",
      keyPoints: [],
      additionalContext: "",
    });
    setCurrentStep("ai");
    setAiSectionOpen(true);
    setPreviewText("");
    setSuggestions([]);
  };

  const handleGenerateWithAI = () => {
    const targetAudience: TargetAudience =
      formData.recipientType === RecipientType.STUDENTS
        ? "students"
        : formData.recipientType === RecipientType.INSTRUCTORS
          ? "instructors"
          : formData.recipientType === RecipientType.MANAGERS
            ? "managers"
            : "all";

    generateEmail(
      {
        campaignType: aiSettings.campaignType,
        targetAudience,
        tone: aiSettings.tone,
        language: aiSettings.language,
        provider: aiSettings.provider,
        subject: formData.subject || undefined,
        keyPoints:
          aiSettings.keyPoints.length > 0 ? aiSettings.keyPoints : undefined,
        additionalContext: aiSettings.additionalContext || undefined,
      },
      {
        onSuccess: (response) => {
          setFormData((prev) => ({
            ...prev,
            subject: response.data.subject,
            content: response.data.content,
          }));
          setPreviewText(response.data.previewText);
          toast.success("Email content generated!");
          // Auto-collapse AI section and move to content step
          setAiSectionOpen(false);
          setCurrentStep("content");
        },
      },
    );
  };

  const handleGetSuggestions = () => {
    if (!formData.content) {
      toast.error("Please add some content first");
      return;
    }

    getSuggestions(
      {
        content: formData.content,
        count: 5,
        language: aiSettings.language,
        provider: aiSettings.provider,
      },
      {
        onSuccess: (response) => {
          setSuggestions(response.data.suggestions);
          setShowSuggestions(true);
        },
      },
    );
  };

  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setAiSettings((prev) => ({
        ...prev,
        keyPoints: [...prev.keyPoints, newKeyPoint.trim()],
      }));
      setNewKeyPoint("");
    }
  };

  const removeKeyPoint = (index: number) => {
    setAiSettings((prev) => ({
      ...prev,
      keyPoints: prev.keyPoints.filter((_, i) => i !== index),
    }));
  };

  const getStepIndex = (step: WizardStep) =>
    STEPS.findIndex((s) => s.id === step);
  const currentStepIndex = getStepIndex(currentStep);

  const canProceedToContent =
    formData.title.trim() !== "" && !!formData.recipientType;
  const canProceedToReview =
    canProceedToContent &&
    formData.subject.trim() !== "" &&
    formData.content.trim() !== "";

  const goToStep = (step: WizardStep) => {
    const targetIndex = getStepIndex(step);
    if (targetIndex === 0) {
      setCurrentStep(step);
    } else if (targetIndex === 1 && canProceedToContent) {
      setCurrentStep(step);
    } else if (targetIndex === 2 && canProceedToReview) {
      setCurrentStep(step);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col p-0 gap-0 overflow-y-scroll",
          isMobile
            ? "w-full h-dvh max-w-full max-h-full rounded-none"
            : "max-w-4xl md:max-w-full md:w-[60vw] w-[95vw] h-[85vh] max-h-[85vh]",
        )}
      >
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Create Campaign
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {currentStep === "ai" && "Configure AI settings to generate email"}
            {currentStep === "content" &&
              "Edit and customize your email content"}
            {currentStep === "review" && "Review your campaign before creating"}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <CampaignWizardSteps
          currentStep={currentStep}
          goToStep={goToStep}
          canProceedToContent={!!canProceedToContent}
          canProceedToReview={canProceedToReview}
        />

        {/* Content Area */}
        <ScrollArea className="flex-1 px-4 sm:px-6">
          <div className="py-4 space-y-4">
            {/* STEP 1: AI Settings */}
            {currentStep === "ai" && (
              <AISettingStep
                formData={formData}
                setFormData={setFormData}
                aiSettings={aiSettings}
                setAiSettings={setAiSettings}
                newKeyPoint={newKeyPoint}
                setNewKeyPoint={setNewKeyPoint}
                addKeyPoint={addKeyPoint}
                removeKeyPoint={removeKeyPoint}
                aiSectionOpen={aiSectionOpen}
                setAiSectionOpen={setAiSectionOpen}
                isMobile={isMobile}
              />
            )}

            {/* STEP 2: Content */}
            {currentStep === "content" && (
              <ContentStep
                formData={formData}
                setFormData={setFormData}
                isLoadingSuggestions={isLoadingSuggestions}
                handleGetSuggestions={handleGetSuggestions}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                suggestions={suggestions}
                isGenerating={isGenerating}
                handleGenerateWithAI={handleGenerateWithAI}
                isMobile={isMobile}
              />
            )}

            {/* STEP 3: Review */}
            {currentStep === "review" && (
              <ReviewStep formData={formData} previewText={previewText} />
            )}
          </div>
        </ScrollArea>

        {/* Footer with Navigation */}
        <EmailCompainDialogFooter
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onOpenChange={onOpenChange}
          isPending={isPending}
          canProceedToContent={canProceedToContent}
          canProceedToReview={canProceedToReview}
          isGenerating={isGenerating}
          handleGenerateWithAI={handleGenerateWithAI}
          handleSubmit={handleSubmit}
          isMobile={isMobile}
          goToStep={goToStep}
        />
      </DialogContent>
    </Dialog>
  );
}
