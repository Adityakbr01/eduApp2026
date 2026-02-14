"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
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
import {
  Form,
  FormControl,
  FormDescription,
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
import { ContentType, useCreateContent } from "@/services/courses";
import {
  createContentSchema,
  CreateContentInput,
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
  courseId,
}: ContentDialogProps) {
  const createContent = useCreateContent();
  const [error, setError] = useState<string | null>(null);

  // Custom states for file upload management
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);

  const form = useForm<CreateContentInput>({
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
    },
  });

  const contentType = form.watch("type");

  const resetForm = () => {
    form.reset({
      title: "",
      type: ContentType.VIDEO,
      marks: 100,
      isVisible: true,
      isPreview: false,
      minWatchPercent: 90,
      videoUrl: "",
      pdfUrl: "",
    });
    setUploadedKey(null);
    setDuration(0);
    setError(null);
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const onSubmit = async (data: CreateContentInput) => {
    try {
      // Map form data to API DTO
      const contentData: any = {
        title: data.title.trim(),
        type: data.type,
        marks: data.marks,
        isVisible: true,
        isPreview: data.isPreview,
      };

      if (data.type === ContentType.VIDEO) {
        // Video allows optional key on backend, but we can set pending if we want to be explicit
        const finalKey = uploadedKey || data.videoUrl;
        contentData.video = {
          rawKey: finalKey,
          duration,
          minWatchPercent: data.minWatchPercent,
        };
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
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.error("Form Validation Errors:", errors);
                // Optional: Set a general error message state if you want it to appear in the generic Alert
                // setError("Please fix the highlighted errors.");
              })}
              className="space-y-6 py-4"
            >
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

                  <div className="space-y-2">
                    <FormLabel>Upload Video</FormLabel>
                    <div className="p-4 border border-dashed rounded-md text-center text-sm text-muted-foreground">
                      Upload functionality requires content creation first.
                    </div>
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
