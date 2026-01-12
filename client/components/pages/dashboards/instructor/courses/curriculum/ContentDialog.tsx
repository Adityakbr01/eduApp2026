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
import { Loader2 } from "lucide-react";

import { S3Uploader } from "@/lib/s3/S3Uploader";
import {
  ContentType,
  CreateContentDTO,
  useCreateContent,
} from "@/services/courses";
import { FileType } from "@/services/uploads";

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

  // Raw S3 key
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  // Duration - calculated locally
  const [duration, setDuration] = useState<number>(0);

  const createContent = useCreateContent();

  const resetForm = () => {
    setTitle("");
    setMarks(10);
    setIsPreview(false);
    setMinWatchPercent(90);
    setUploadedKey(null);
    setFileName("");
    setDuration(0);
    setContentType(ContentType.VIDEO);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  // LOCAL duration calculation from File object
  const calculateDurationLocally = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const media = file.type.startsWith("audio/")
        ? new Audio(url)
        : document.createElement("video");

      media.preload = "metadata";
      media.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(Math.round(media.duration || 0));
      };
      media.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(0);
      };
      media.src = url;
    });
  };

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !uploadedKey) return;

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

    // Always send duration (even if 0)
    if (
      contentType === ContentType.VIDEO ||
      contentType === ContentType.AUDIO
    ) {
      contentData.video = {
        rawKey: uploadedKey, // Raw key only
        duration: duration, // Always number
        minWatchPercent,
      };
    }

    if (contentType === ContentType.PDF) {
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
    } catch (error) {
      console.error("Error creating content:", error);
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

  const clearUpload = () => {
    setUploadedKey(null);
    setFileName("");
    setDuration(0);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Content</DialogTitle>
          <DialogDescription>
            Add new content to this lesson. Files are auto-uploaded to S3.
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
                  clearUpload();
                }}
                disabled={createContent.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ContentType.VIDEO}>Video</SelectItem>
                  <SelectItem value={ContentType.AUDIO}>Audio</SelectItem>
                  <SelectItem value={ContentType.PDF}>PDF Document</SelectItem>
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
                placeholder="e.g., Introduction to React"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={createContent.isPending}
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
                  onChange={(e) => setMarks(parseInt(e.target.value) || 0)}
                  disabled={createContent.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>Free Preview</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={isPreview}
                    onCheckedChange={setIsPreview}
                    disabled={createContent.isPending}
                  />
                  <span className="text-sm text-muted-foreground">
                    {isPreview ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            {/* File Upload Tabs */}
            <Tabs value={contentType}>
              {/* VIDEO */}
              <TabsContent value={ContentType.VIDEO} className="space-y-4">
                <S3Uploader
                  accept={{ "video/*": [] }}
                  multiple={false}
                  maxFiles={1}
                  maxFileSizeMB={500}
                  uploadType={FileType.VIDEO}
                  getKey={(file) =>
                    `courses/${courseId}/lessons/${lessonId}/videos/${Date.now()}-${
                      file.name
                    }`
                  }
                  onDrop={async (files) => {
                    if (files.length > 0) {
                      const file = files[0];
                      setFileName(file.name);
                      const dur = await calculateDurationLocally(file);
                      setDuration(dur);
                    }
                  }}
                  onUploaded={([key]) => {
                    setUploadedKey(key);
                  }}
                />

                {uploadedKey && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Duration (seconds)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={duration}
                          onChange={(e) => setDuration(+e.target.value || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Min Watch %</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={minWatchPercent}
                          onChange={(e) =>
                            setMinWatchPercent(+e.target.value || 90)
                          }
                        />
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* AUDIO */}
              <TabsContent value={ContentType.AUDIO} className="space-y-4">
                <S3Uploader
                  accept={{ "audio/*": [] }}
                  multiple={false}
                  maxFiles={1}
                  maxFileSizeMB={50}
                  uploadType={FileType.AUDIO}
                  getKey={(file) =>
                    `courses/${courseId}/lessons/${lessonId}/audios/${Date.now()}-${
                      file.name
                    }`
                  }
                  onDrop={async (files) => {
                    if (files.length > 0) {
                      const file = files[0];
                      setFileName(file.name);
                      const dur = await calculateDurationLocally(file);
                      setDuration(dur);
                    }
                  }}
                  onUploaded={([key]) => setUploadedKey(key)}
                />
              </TabsContent>

              {/* PDF */}
              <TabsContent value={ContentType.PDF} className="space-y-4">
                <S3Uploader
                  accept={{ "application/pdf": [] }}
                  multiple={false}
                  maxFiles={1}
                  maxFileSizeMB={20}
                  uploadType={FileType.DOCUMENT}
                  getKey={(file) =>
                    `courses/${courseId}/lessons/${lessonId}/pdfs/${Date.now()}-${
                      file.name
                    }`
                  }
                  onDrop={(files) => {
                    if (files.length > 0) {
                      setFileName(files[0].name);
                    }
                  }}
                  onUploaded={([key]) => setUploadedKey(key)}
                />
              </TabsContent>

              {/* QUIZ */}
              <TabsContent value={ContentType.QUIZ}>
                <div className="p-6 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
                  Quiz will be created after saving. Add questions later.
                </div>
              </TabsContent>

              {/* ASSIGNMENT */}
              <TabsContent value={ContentType.ASSIGNMENT}>
                <div className="p-6 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
                  Assignment will be configured after saving.
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createContent.isPending}
            >
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
