import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import LessonVideoUpload from "@/lib/s3/LessonVideoUpload";
import {
  ContentLevel,
  ContentType,
  ILessonContent,
  UpdateContentDTO,
  useUpdateContent,
} from "@/services/courses";
import {
  EditContentFormValues,
  editContentSchema,
} from "@/validators/contentSchema";
import VdoCipherVideoUpload from "./VdoCipherVideoUpload";

type EditContentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ILessonContent;
  courseId: string;
  lessonId: string;
  getCurrentFileUrl: () => string | undefined;
};

export function EditContentDialog({
  open,
  onOpenChange,
  content,
  courseId,
  lessonId,
  getCurrentFileUrl,
}: EditContentDialogProps) {
  const updateContent = useUpdateContent();
  const [isUploading, setIsUploading] = useState(false);
  const [newFileKey, setNewFileKey] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  // New states for array fields
  const [tagInput, setTagInput] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const form = useForm<EditContentFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(editContentSchema) as any,
    defaultValues: {
      title: "",
      marks: 0,
      isPreview: false,
      minWatchPercent: 90,
      rawKey: "",
      tags: [],
      description: "",
      level: ContentLevel.LOW,
      relatedLinks: [],
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open && content) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setNewFileKey(null);
      setVideoId(content.video?.videoId || null); // Initialize videoId state
      form.reset({
        title: content.title,
        marks: content.marks,
        isPreview: content.isPreview,
        minWatchPercent: content.video?.minWatchPercent || 90,
        duration:
          content.video?.duration != null
            ? Number(content.video.duration.toFixed(0))
            : 0,
        rawKey: "",
        // videoId: content.video?.videoId || null, // Not needed in form if we use state, but consistent
        tags: content.tags || [],
        description: content.description || "",
        level: content.level || ContentLevel.LOW,
        relatedLinks: content.relatedLinks || [],
      });
      setTagInput("");
      setLinkTitle("");
      setLinkUrl("");
    }
  }, [open, content, form]);

  const onSubmit = async (data: EditContentFormValues) => {
    try {
      const updateData: UpdateContentDTO = {
        title: data.title.trim(),
        marks: data.marks,
        isPreview: data.isPreview,
        tags: data.tags,
        description: data.description,
        level: data.level,
        relatedLinks: data.relatedLinks,
      };

      // Handle specific content types
      if (content.type === ContentType.VIDEO) {
        updateData.video = {
          // Duration update logic preserved from previous implementation?
          // The previous code had `editDuration`. If duration editing isn't in the form,
          // we should preserve existing or default.
          // Looking at previous code, editDuration was state.
          // If we don't expose it in UI, we might lose the ability to edit it manually if that was desired.
          // But normally duration comes from upload.
          // Let's assume for now we keep existing or use what's there.
          // The previous code had `setEditDuration` but no input for it in the dialog UI shown in the view_file!
          // Wait, I should check if there was an input for duration.
          // I verified the file content in Step 301, there was NO input for duration.
          // So `editDuration` was just state initialized from content.

          minWatchPercent: data.minWatchPercent,
          hlsKey: content.video?.hlsKey,
          rawKey: content.video?.rawKey,
          duration:
            content.video?.duration != null
              ? Number(content.video.duration.toFixed(0))
              : data.duration,
          videoId: videoId || undefined,
        };

        if (data.rawKey) {
          updateData.video.rawKey = data.rawKey;
        }
      }

      if (content.type === ContentType.AUDIO) {
        // Similar logic for Audio
        if (data.rawKey) {
          updateData.audio = {
            rawKey: data.rawKey,
            // duration?
          };
        }
      }

      if (content.type === ContentType.PDF) {
        if (data.rawKey) {
          updateData.pdf = {
            rawKey: data.rawKey,
          };
        }
      }

      await updateContent.mutateAsync({
        contentId: content._id,
        data: updateData,
        lessonId,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Update failed:", error);
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

  const isVideoUploadDisabled = false; // logic for disabled upload if processing?
  // videoStatus was in parent. We can derive from content.video?.status if we want.

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Content</DialogTitle>
          <DialogDescription>
            Update details or replace the file.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
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

            {/* Marks + Preview */}
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
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
                              <span className="font-medium">{link.title}</span>
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

            {/* Current file */}
            {getCurrentFileUrl() && !newFileKey && (
              <div className="space-y-2">
                <FormLabel>Current File</FormLabel>
                <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground truncate">
                  {getCurrentFileUrl()}
                </div>
              </div>
            )}

            {/* Replace file */}
            {(content.type === ContentType.VIDEO ||
              content.type === ContentType.AUDIO ||
              content.type === ContentType.PDF) && (
              <div className="space-y-4">
                <FormLabel>Replace File</FormLabel>

                {content.type === ContentType.VIDEO && (
                  <VdoCipherVideoUpload
                    courseId={courseId}
                    lessonId={lessonId}
                    lessonContentId={content._id}
                    disabled={isVideoUploadDisabled}
                    onUploadStateChange={setIsUploading}
                    onUploaded={(videoId) => {
                      if (videoId) {
                        setNewFileKey(videoId);
                        setVideoId(videoId);
                      } else {
                        setNewFileKey("processed-by-vdo");
                        setVideoId(null);
                      }
                    }}
                  />
                )}

                {/* TODO: Add Audio/PDF upload components if they exist or use generic? 
                         The previous code only showed LessonVideoUpload for VIDEO type specifically in the logical block, 
                         but the condition wrapped VIDEO, AUDIO, PDF. 
                         Wait, looking at previous Step 301 line 146: it ONLY rendered LessonVideoUpload if type === VIDEO.
                         So Audio/PDF replacement wasn't fully implemented or used a different component not shown?
                         Ah, strictly interpretation of previous code: 
                         It only rendered LessonVideoUpload for VIDEO. 
                         I will preserve that behavior.
                     */}

                {newFileKey && (
                  <div className="rounded-md border p-3 text-xs bg-muted">
                    <p className="font-medium">New file uploaded</p>
                    <p className="break-all text-muted-foreground">
                      {newFileKey}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Video specific */}
            {content.type === ContentType.VIDEO && (
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="minWatchPercent"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Min Watch %</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
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
                  name="duration"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Duration (seconds)</FormLabel>
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
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateContent.isPending || isUploading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={updateContent.isPending || isUploading}
              >
                {updateContent.isPending || isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
