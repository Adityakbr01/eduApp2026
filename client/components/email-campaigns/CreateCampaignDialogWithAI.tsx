"use client";

import { useState } from "react";
import { useCreateCampaign, RecipientType, CampaignPriority, type CreateCampaignDTO } from "@/services/campaigns";
import { useGenerateEmail, useGetSubjectSuggestions, type CampaignType, type TargetAudience, type EmailTone } from "@/services/ai";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmailLivePreview } from "./EmailLivePreview";
import { 
    Sparkles, 
    Loader2, 
    Wand2, 
    RefreshCw, 
    Lightbulb,
    PenLine,
    Eye,
    ChevronRight,
    ChevronLeft,
    Plus,
    X
} from "lucide-react";
import toast from "react-hot-toast";

interface CreateCampaignDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CAMPAIGN_TYPES: { value: CampaignType; label: string; description: string }[] = [
    { value: "welcome", label: "Welcome", description: "Welcome new users to your platform" },
    { value: "promotion", label: "Promotion", description: "Announce sales or special offers" },
    { value: "courseUpdate", label: "Course Update", description: "Notify about course changes" },
    { value: "newsletter", label: "Newsletter", description: "Share updates and highlights" },
    { value: "announcement", label: "Announcement", description: "Important platform news" },
    { value: "reminder", label: "Reminder", description: "Gentle nudges and reminders" },
    { value: "custom", label: "Custom", description: "Create your own email" },
];

const TONES: { value: EmailTone; label: string }[] = [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly" },
    { value: "urgent", label: "Urgent" },
    { value: "casual", label: "Casual" },
];

export function CreateCampaignDialog({ open, onOpenChange }: CreateCampaignDialogProps) {
    const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose");
    const [step, setStep] = useState<1 | 2>(1);
    
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
    const { mutate: getSuggestions, isPending: isLoadingSuggestions } = useGetSubjectSuggestions();

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
            keyPoints: [],
            additionalContext: "",
        });
        setStep(1);
        setPreviewText("");
        setSuggestions([]);
    };

    const handleGenerateWithAI = () => {
        const targetAudience: TargetAudience = 
            formData.recipientType === RecipientType.STUDENTS ? "students" :
            formData.recipientType === RecipientType.INSTRUCTORS ? "instructors" :
            formData.recipientType === RecipientType.MANAGERS ? "managers" : "all";

        generateEmail({
            campaignType: aiSettings.campaignType,
            targetAudience,
            tone: aiSettings.tone,
            subject: formData.subject || undefined,
            keyPoints: aiSettings.keyPoints.length > 0 ? aiSettings.keyPoints : undefined,
            additionalContext: aiSettings.additionalContext || undefined,
        }, {
            onSuccess: (response) => {
                setFormData(prev => ({
                    ...prev,
                    subject: response.data.subject,
                    content: response.data.content,
                }));
                setPreviewText(response.data.previewText);
                toast.success("Email content generated!");
                setStep(2);
            },
        });
    };

    const handleGetSuggestions = () => {
        if (!formData.content) {
            toast.error("Please add some content first");
            return;
        }

        getSuggestions({ content: formData.content, count: 5 }, {
            onSuccess: (response) => {
                setSuggestions(response.data.suggestions);
                setShowSuggestions(true);
            },
        });
    };

    const addKeyPoint = () => {
        if (newKeyPoint.trim()) {
            setAiSettings(prev => ({
                ...prev,
                keyPoints: [...prev.keyPoints, newKeyPoint.trim()],
            }));
            setNewKeyPoint("");
        }
    };

    const removeKeyPoint = (index: number) => {
        setAiSettings(prev => ({
            ...prev,
            keyPoints: prev.keyPoints.filter((_, i) => i !== index),
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-6xl flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Create Email Campaign
                    </DialogTitle>
                    <DialogDescription>
                        Use AI to generate engaging email content or write your own
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "compose" | "preview")} className="flex-1">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="compose" className="flex items-center gap-2">
                            <PenLine className="h-4 w-4" />
                            Compose
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Live Preview
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="compose" className="flex-1 overflow-y-auto pr-2">
                        <form onSubmit={handleSubmit} className="space-y-6 min-h-[60vh] max-h-[60vh]">
                            {step === 1 && (
                                <>
                                    {/* AI Generation Settings */}
                                    <div className="rounded-lg border bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-4 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Wand2 className="h-5 w-5 text-purple-600" />
                                            <h3 className="font-semibold">AI Email Generator</h3>
                                            <Badge variant="secondary" className="ml-auto">Powered by Gemini</Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Campaign Type */}
                                            <div className="space-y-2">
                                                <Label>Email Type</Label>
                                                <Select
                                                    value={aiSettings.campaignType}
                                                    onValueChange={(v) => setAiSettings(prev => ({ ...prev, campaignType: v as CampaignType }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CAMPAIGN_TYPES.map((type) => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                <div>
                                                                    <span className="font-medium">{type.label}</span>
                                                                    <p className="text-xs text-muted-foreground">{type.description}</p>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Tone */}
                                            <div className="space-y-2">
                                                <Label>Tone</Label>
                                                <Select
                                                    value={aiSettings.tone}
                                                    onValueChange={(v) => setAiSettings(prev => ({ ...prev, tone: v as EmailTone }))}
                                                >
                                                    <SelectTrigger>
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
                                        <div className="space-y-2">
                                            <Label>Key Points to Include (Optional)</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Add a key point..."
                                                    value={newKeyPoint}
                                                    onChange={(e) => setNewKeyPoint(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyPoint())}
                                                />
                                                <Button type="button" variant="outline" size="icon" onClick={addKeyPoint}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {aiSettings.keyPoints.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {aiSettings.keyPoints.map((point, index) => (
                                                        <Badge key={index} variant="secondary" className="gap-1">
                                                            {point}
                                                            <button type="button" onClick={() => removeKeyPoint(index)}>
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Additional Context */}
                                        <div className="space-y-2">
                                            <Label>Additional Context (Optional)</Label>
                                            <Textarea
                                                placeholder="Any specific details, offers, dates, or information to include..."
                                                value={aiSettings.additionalContext}
                                                onChange={(e) => setAiSettings(prev => ({ ...prev, additionalContext: e.target.value }))}
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Basic Settings */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Title */}
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Campaign Title *</Label>
                                            <Input
                                                id="title"
                                                placeholder="Internal name for this campaign"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                            />
                                        </div>

                                        {/* Recipients */}
                                        <div className="space-y-2">
                                            <Label htmlFor="recipientType">Recipients *</Label>
                                            <Select
                                                value={formData.recipientType}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, recipientType: value as RecipientType })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={RecipientType.ALL}>All Users</SelectItem>
                                                    <SelectItem value={RecipientType.STUDENTS}>Students Only</SelectItem>
                                                    <SelectItem value={RecipientType.INSTRUCTORS}>Instructors Only</SelectItem>
                                                    <SelectItem value={RecipientType.MANAGERS}>Managers Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Priority */}
                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Priority</Label>
                                            <Select
                                                value={formData.priority}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, priority: value as CampaignPriority })
                                                }
                                            >
                                                <SelectTrigger>
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
                                        <div className="space-y-2">
                                            <Label htmlFor="subject">Subject Line (Optional)</Label>
                                            <Input
                                                id="subject"
                                                placeholder="Leave empty to auto-generate"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Generate Button */}
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            variant="outline"
                                        >
                                            Write Manually
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleGenerateWithAI}
                                            disabled={isGenerating || !formData.title}
                                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="h-4 w-4 mr-2" />
                                                    Generate with AI
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    {/* Subject */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="subject">Email Subject *</Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleGetSuggestions}
                                                disabled={isLoadingSuggestions || !formData.content}
                                            >
                                                {isLoadingSuggestions ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Lightbulb className="h-4 w-4" />
                                                )}
                                                <span className="ml-1">Get suggestions</span>
                                            </Button>
                                        </div>
                                        <Input
                                            id="subject"
                                            placeholder="Enter email subject"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            required
                                        />
                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="rounded-lg border p-3 space-y-2 bg-muted/50">
                                                <p className="text-xs font-medium text-muted-foreground">AI Suggestions:</p>
                                                <div className="space-y-1">
                                                    {suggestions.map((suggestion, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-primary/10 transition-colors"
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, subject: suggestion }));
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
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="content">Email Content (HTML) *</Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleGenerateWithAI}
                                                disabled={isGenerating}
                                            >
                                                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                                                <span className="ml-1">Regenerate</span>
                                            </Button>
                                        </div>
                                        <Textarea
                                            id="content"
                                            placeholder="<h1>Hello!</h1><p>Welcome to our platform...</p>"
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            rows={12}
                                            required
                                            className="font-mono text-sm"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Use HTML to format your email. Switch to Preview tab to see how it looks.
                                        </p>
                                    </div>

                                    {/* Back Button */}
                                    <div className="flex justify-start">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setStep(1)}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Back to AI Settings
                                        </Button>
                                    </div>
                                </>
                            )}
                        </form>
                    </TabsContent>

                    <TabsContent value="preview" className="mt-0">
                        <EmailLivePreview
                            subject={formData.subject}
                            content={formData.content}
                            previewText={previewText}
                        />
                    </TabsContent>
                </Tabs>

                <DialogFooter className="border-t pt-4 mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || !formData.title || !formData.subject || !formData.content}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Campaign"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
