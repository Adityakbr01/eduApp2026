"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge"; // Assuming Badge exists for tags
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea"; // Assuming Textarea component exists, check or use Input as fallback
import {
  ContentLevel,
  ContentType,
  CreateContentDTO,
  useCreateContent,
} from "@/services/courses";
import {
  CreateContentInput,
  createContentSchema,
} from "@/validators/contentSchema";

interface ContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
  courseId: string;
}

// We need a form schema that matches what the specific form fields collect.
// The createContentSchema from validators/contentSchema is a bit broad (includes all types).
// We'll use it but might need to adjust some inputs or casting.

// We need to extend the inputs to include rawKey for upload which isn't in the schema directly as 'rawKey'
// but mapped to videoUrl etc in the refine step?
// Actually createContentSchema expects videoUrl/pdfUrl.
// But the form UI uploads a file and gets a key.
// We should probably add a temporary field for 'uploadedKey' in the form values or manage it as state
// and map it to the correct schema field on submit.
// Or better, update schema to accept rawKey if we want.
// For now, I'll manage uploadedKey in state as before to keep it simple, OR integrating it into form state
// makes validation easier.
// Let's use form state for 'tempKey' and 'duration'.

export function ContentDialog({
  open,
  onOpenChange,
  lessonId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  courseId,
}: ContentDialogProps) {
  const createContent = useCreateContent();
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Custom states for file upload management
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);

  // Video source mode: upload file vs paste VdoCipher videoId
  const [videoMode, setVideoMode] = useState<"upload" | "videoId">("upload");
  const [directVideoId, setDirectVideoId] = useState("");

  // New states for array fields
  const [tagInput, setTagInput] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const form = useForm<CreateContentInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createContentSchema) as any,
    defaultValues: {
      title: "",
      type: ContentType.VIDEO,
      marks: 100,
      isVisible: true,
      isPreview: false,
      minWatchPercent: 90,
      videoUrl: "",
      pdfUrl: "",
      tags: [],
      description: "",
      level: ContentLevel.LOW,
      relatedLinks: [],
    },
  });

  const contentType = form.watch("type");

  const resetForm = useCallback(() => {
    form.reset({
      title: "",
      type: ContentType.VIDEO,
      marks: 100,
      isVisible: true,
      isPreview: false,
      minWatchPercent: 90,
      videoUrl: "",
      pdfUrl: "",
      tags: [],
      description: "",
      level: ContentLevel.LOW,
      relatedLinks: [],
    });
    setUploadedKey(null);
    setDuration(0);
    setVideoMode("upload");
    setDirectVideoId("");
    setTagInput("");
    setLinkTitle("");
    setLinkUrl("");
    setError(null);
    setValidationErrors([]);
  }, [form]);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  const onSubmit = async (data: CreateContentInput) => {
    try {
      // Map form data to API DTO
      const contentData = {
        title: data.title.trim(),
        type: data.type,
        marks: data.marks,
        isVisible: true,
        isPreview: data.isPreview,
        tags: data.tags,
        description: data.description,
        level: data.level,
        relatedLinks: data.relatedLinks,
      } as CreateContentDTO;

      if (data.type === ContentType.VIDEO) {
        if (videoMode === "videoId" && directVideoId.trim()) {
          // Direct VdoCipher videoId — no server processing needed
          contentData.video = {
            videoId: directVideoId.trim(),
            status: "READY",
            minWatchPercent: data.minWatchPercent,
            duration,
          };
        } else {
          // Upload mode — server will process the video
          const finalKey = uploadedKey || data.videoUrl;
          contentData.video = {
            rawKey: finalKey,
            duration,
            minWatchPercent: data.minWatchPercent,
          };
        }
      } else if (data.type === ContentType.AUDIO) {
        // Backend requires 'url' (mapped from rawKey). Send placeholder if missing to allow creation.
        const finalKey = uploadedKey || data.videoUrl || "pending_upload";
        contentData.audio = {
          rawKey: finalKey,
          duration,
        };
      } else if (data.type === ContentType.PDF) {
        // Backend requires 'url'. Send placeholder.
        const finalKey = uploadedKey || data.pdfUrl || "pending_upload";
        contentData.pdf = {
          rawKey: finalKey,
        };
      }

      await createContent.mutateAsync({
        lessonId,
        data: contentData,
      });
      onOpenChange(false);
    } catch (err) {
      console.error("Create content error:", err);
      setError("Failed to create content. Please try again.");
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag) {
      const currentTags = form.getValues("tags") || [];
      if (!currentTags.includes(tag)) {
        form.setValue("tags", [...currentTags, tag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tagToRemove),
    );
  };

  const handleAddLink = () => {
    if (linkTitle.trim() && linkUrl.trim()) {
      const currentLinks = form.getValues("relatedLinks") || [];
      form.setValue("relatedLinks", [
        ...currentLinks,
        { title: linkTitle.trim(), url: linkUrl.trim() },
      ]);
      setLinkTitle("");
      setLinkUrl("");
    }
  };

  const removeLink = (index: number) => {
    const currentLinks = form.getValues("relatedLinks") || [];
    form.setValue(
      "relatedLinks",
      currentLinks.filter((_, i) => i !== index),
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (!val) resetForm();
          onOpenChange(val);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Content </DialogTitle>
            <DialogDescription>
              Files are uploaded directly to S3.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                (data) => {
                  setValidationErrors([]);
                  onSubmit(data);
                },
                (errors) => {
                  console.error("Form Validation Errors:", errors);
                  const messages: string[] = [];
                  Object.entries(errors).forEach(([key, value]) => {
                    if (value?.message) {
                      messages.push(`${key}: ${value.message}`);
                    } else if (value?.root?.message) {
                      messages.push(`${key}: ${value.root.message}`);
                    }
                  });
                  setValidationErrors(messages);
                  setError(
                    messages.length > 0
                      ? "Please fix the form errors below."
                      : "Validation failed.",
                  );
                },
              )}
              className="space-y-6 py-4"
            >
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-sm text-destructive">
                  <p className="font-medium mb-1">Form Errors:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Content Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        // Reset type specific fields if needed
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Marks & Preview */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="marks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marks</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(+e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPreview"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-8">
                      <div className="space-y-0.5">
                        <FormLabel>Free Preview</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a tag..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleAddTag}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value?.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-2 py-1 flex items-center gap-1"
                            >
                              {tag}
                              <X
                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                onClick={() => removeTag(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Level */}
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ContentLevel).map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Related Links */}
              <FormField
                control={form.control}
                name="relatedLinks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Links</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Link Title"
                            value={linkTitle}
                            onChange={(e) => setLinkTitle(e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Link URL"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleAddLink}
                            disabled={!linkTitle || !linkUrl}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2 mt-2">
                          {field.value?.map((link, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 border rounded-md text-sm"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {link.title}
                                </span>
                                <span className="text-muted-foreground text-xs truncate max-w-50">
                                  {link.url}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLink(index)}
                                className="text-destructive hover:text-destructive/90"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Tabs
                value={contentType}
                onValueChange={(v) => form.setValue("type", v as ContentType)}
              >
                {/* VIDEO */}
                <TabsContent value={ContentType.VIDEO} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="minWatchPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Watch Percentage</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            {...field}
                            onChange={(e) => field.onChange(+e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Video source toggle */}
                  <div className="space-y-3">
                    <FormLabel>Video Source</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setVideoMode("upload")}
                        className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all cursor-pointer ${
                          videoMode === "upload"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-muted hover:border-muted-foreground/30 text-muted-foreground"
                        }`}
                      >
                        <Upload className="h-4 w-4" />
                        Upload Video
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoMode("videoId")}
                        className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all cursor-pointer ${
                          videoMode === "videoId"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-muted hover:border-muted-foreground/30 text-muted-foreground"
                        }`}
                      >
                        🔗 VdoCipher Video ID
                      </button>
                    </div>

                    {videoMode === "upload" ? (
                      <div className="p-4 border border-dashed rounded-md text-center text-sm text-muted-foreground">
                        Upload functionality requires content creation first.
                        You can upload the video after adding this item.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          placeholder="e.g. a1b2c3d4e5f6g7h8"
                          value={directVideoId}
                          onChange={(e) => setDirectVideoId(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Paste the Video ID from your VdoCipher dashboard. The
                          video must already be uploaded and processed on
                          VdoCipher.{" "}
                          <span className="font-medium text-foreground">
                            This saves server resources
                          </span>{" "}
                          since no upload or transcoding is needed on our end.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* AUDIO */}
                <TabsContent value={ContentType.AUDIO}>
                  <div className="p-4 border rounded-md text-center text-muted-foreground">
                    Audio upload functionality requires content creation first.
                    You can upload the audio file after adding this item.
                  </div>
                </TabsContent>

                <TabsContent value={ContentType.PDF}>
                  <div className="p-4 border rounded-md text-center text-muted-foreground">
                    PDF upload functionality requires content creation first.
                    You can upload the PDF file after adding this item.
                  </div>
                </TabsContent>

                <TabsContent value={ContentType.QUIZ}>
                  <div className="p-6 bg-muted rounded-lg text-center text-sm">
                    Quiz will be configured after saving.
                  </div>
                </TabsContent>

                <TabsContent value={ContentType.ASSIGNMENT}>
                  <div className="p-6 bg-muted rounded-lg text-center text-sm">
                    Assignment will be configured after saving.
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createContent.isPending || isUploading}
                >
                  {createContent.isPending || isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isUploading ? "Uploading..." : "Adding..."}
                    </>
                  ) : (
                    "Add Content"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
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
