"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  ContentType,
  CreateContentDTO,
  useCreateContent,
} from "@/services/courses";
import { Loader2 } from "lucide-react";

interface ContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
  courseId: string;
}

// Helper to format Date for datetime-local input
const toDateTimeLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export function ContentDialog({
  open,
  onOpenChange,
  lessonId,
}: ContentDialogProps) {
  const [contentType, setContentType] = useState<ContentType>(
    ContentType.VIDEO,
  );
  const [title, setTitle] = useState("");
  const [marks, setMarks] = useState<number>(100);
  const [isPreview, setIsPreview] = useState(false);
  const [minWatchPercent, setMinWatchPercent] = useState<number>(90);
  // S3
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);

  // Deadline & Penalty (Initialize with Defaults)
  const [startDate, setStartDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    return toDateTimeLocal(tomorrow);
  });

  const [dueDate, setDueDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    const nextWeek = new Date(tomorrow);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return toDateTimeLocal(nextWeek);
  });

  const [penaltyPercent, setPenaltyPercent] = useState<number>(30); // Default 30%

  // Error State
  const [error, setError] = useState<string | null>(null);

  const createContent = useCreateContent();

  const resetForm = () => {
    setTitle("");
    setMarks(100);
    setIsPreview(false);
    setMinWatchPercent(90);
    setUploadedKey(null);
    setDuration(0);
    setContentType(ContentType.VIDEO);

    // Restore defaults
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    setStartDate(toDateTimeLocal(tomorrow));

    const nextWeek = new Date(tomorrow);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setDueDate(toDateTimeLocal(nextWeek));

    setPenaltyPercent(30);
    setError(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Strict Date Validation
    const now = new Date();
    if (startDate) {
      if (new Date(startDate) <= now) {
        setError("Start date must be in the future.");
        return;
      }
    }

    if (dueDate) {
      if (new Date(dueDate) <= now) {
        setError("Due date must be in the future.");
        return;
      }
    }

    if (startDate && dueDate) {
      if (new Date(dueDate) <= new Date(startDate)) {
        setError("Due date must be after the start date.");
        return;
      }
    }

    const contentData: CreateContentDTO = {
      title: title.trim(),
      type:
        contentType === ContentType.VIDEO
          ? "video"
          : contentType === ContentType.AUDIO
            ? "audio"
            : contentType === ContentType.PDF
              ? "pdf"
              : contentType === ContentType.QUIZ
                ? "quiz"
                : "assignment",
      marks,
      isVisible: true,
      isPreview,
      deadline: {
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        penaltyPercent: penaltyPercent,
      },
    };

    if (
      (contentType === ContentType.VIDEO ||
        contentType === ContentType.AUDIO) &&
      uploadedKey
    ) {
      contentData.video = {
        rawKey: uploadedKey,
        duration,
        minWatchPercent,
      };
    }

    if (contentType === ContentType.PDF && uploadedKey) {
      contentData.pdf = {
        rawKey: uploadedKey,
      };
    }

    try {
      await createContent.mutateAsync({
        lessonId,
        data: contentData,
      });
      handleOpenChange(false);
    } catch (err) {
      console.error("Create content error:", err);
      setError("Failed to create content. Please try again.");
    }
  };

  const isFormValid = () => {
    if (!title.trim()) return false;
    if ([ContentType.AUDIO, ContentType.PDF].includes(contentType)) {
      return !!uploadedKey;
    }
    return true;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Content </DialogTitle>
            <DialogDescription>
              Files are uploaded directly to S3.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Content Type */}
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select
                  value={contentType}
                  onValueChange={(v) => {
                    setContentType(v as ContentType);
                    setUploadedKey(null);
                    setDuration(0);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ContentType.VIDEO}>Video</SelectItem>
                    <SelectItem value={ContentType.AUDIO}>Audio</SelectItem>
                    <SelectItem value={ContentType.PDF}>PDF</SelectItem>
                    <SelectItem value={ContentType.QUIZ}>Quiz</SelectItem>
                    <SelectItem value={ContentType.ASSIGNMENT}>
                      Assignment
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Marks & Preview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Marks</Label>
                  <Input
                    type="number"
                    min={0}
                    value={marks}
                    onChange={(e) => setMarks(+e.target.value || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Free Preview</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={isPreview}
                      onCheckedChange={setIsPreview}
                    />
                    <span className="text-sm">{isPreview ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>

              {/* Deadline & Penalty */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Penalty Percentage (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={penaltyPercent}
                  onChange={(e) => setPenaltyPercent(+e.target.value || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Penalty applied if submitted after due date.
                </p>
              </div>
              <Tabs value={contentType}>
                {/* VIDEO upload lesson video to s3 */}
                <TabsContent value={ContentType.VIDEO}>
                  <div className="space-y-4">
                    {/* Min Watch % */}
                    <div className="space-y-2">
                      <Label>Minimum Watch Percentage</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={minWatchPercent}
                        onChange={(e) =>
                          setMinWatchPercent(+e.target.value || 0)
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* upload AUDIO directlt to prod */}
                <TabsContent value={ContentType.AUDIO}></TabsContent>

                {/* PDF */}
                <TabsContent value={ContentType.PDF}>
                  {/* upload pdf direct to prod */}
                </TabsContent>

                {/* QUIZ */}
                <TabsContent value={ContentType.QUIZ}>
                  <div className="p-6 bg-muted rounded-lg text-center text-sm">
                    Quiz will be configured after saving.
                  </div>
                </TabsContent>

                {/* ASSIGNMENT */}
                <TabsContent value={ContentType.ASSIGNMENT}>
                  <div className="p-6 bg-muted rounded-lg text-center text-sm">
                    Assignment will be configured after saving.
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createContent.isPending || !isFormValid()}
              >
                {createContent.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Content"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invalid Configuration</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setError(null)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
