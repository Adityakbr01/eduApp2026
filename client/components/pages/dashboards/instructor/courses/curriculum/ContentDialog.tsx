"use client";

import { useState } from "react";

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

export function ContentDialog({
  open,
  onOpenChange,
  lessonId,
  courseId,
}: ContentDialogProps) {
  const [contentType, setContentType] = useState<ContentType>(
    ContentType.VIDEO
  );
  const [title, setTitle] = useState("");
  const [marks, setMarks] = useState<number>(10);
  const [isPreview, setIsPreview] = useState(false);
  const [minWatchPercent, setMinWatchPercent] = useState<number>(90);

  // S3
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);

  const createContent = useCreateContent();

  const resetForm = () => {
    setTitle("");
    setMarks(10);
    setIsPreview(false);
    setMinWatchPercent(90);
    setUploadedKey(null);
    setDuration(0);
    setContentType(ContentType.VIDEO);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

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
    }
  };

  const isFormValid = () => {
    if (!title.trim()) return false;
    if (
      [ContentType.VIDEO, ContentType.AUDIO, ContentType.PDF].includes(
        contentType
      )
    ) {
      return !!uploadedKey;
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Content</DialogTitle>
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
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
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
                  <Switch checked={isPreview} onCheckedChange={setIsPreview} />
                  <span className="text-sm">{isPreview ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>

            {/* Upload Tabs */}
            <Tabs value={contentType}>
              {/* VIDEO */}

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
  );
}
