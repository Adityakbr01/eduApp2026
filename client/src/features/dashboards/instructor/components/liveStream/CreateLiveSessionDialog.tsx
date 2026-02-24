"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  ICourse,
  useGetLessonsBySection,
  useGetSectionsByCourse,
} from "@/services/courses";
import { useCreateLiveSession } from "@/services/liveStream";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// ── Zod Schema ──────────────────────────────────────────────────────────────
const createLiveSessionSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  sectionId: z.string().min(1, "Section is required"),
  lessonId: z.string().min(1, "Lesson is required"),
  recordingTitle: z
    .string()
    .min(1, "Recording title is required")
    .max(200, "Title must be 200 characters or less"),
  recordingDescription: z.string().min(1, "Recording description is required"),
  scheduledAt: z.string().optional(),
  autoSaveRecording: z.boolean().default(true),
  liveId: z.string().min(1, "Live ID is required"),
  serverUrl: z.string().min(1, "RTMP Server URL is required"),
  streamKey: z.string().min(1, "Stream Key is required"),
  chatSecret: z.string().min(1, "Chat Secret is required"),
  chatEmbedCode: z.string().min(1, "Chat Embed Code is required"),
  playerEmbedCode: z.string().min(1, "Player Embed Code is required"),
});

type CreateLiveSessionFormValues = z.infer<typeof createLiveSessionSchema>;

// ── Component ───────────────────────────────────────────────────────────────
interface CreateLiveSessionDialogProps {
  courses: ICourse[];
}

export function CreateLiveSessionDialog({
  courses,
}: CreateLiveSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const createSession = useCreateLiveSession();

  const form = useForm<CreateLiveSessionFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createLiveSessionSchema) as any,
    defaultValues: {
      courseId: "",
      sectionId: "",
      lessonId: "",
      recordingTitle: "",
      recordingDescription: "",
      scheduledAt: "",
      autoSaveRecording: true,
      liveId: "",
      serverUrl: "rtmp://live-ingest-01.vd0.co:1935/livestream",
      streamKey: "",
      chatSecret: "",
      chatEmbedCode:
        '<iframe\n  src="https://zenstream.chat?liveId=2606538097584602acfe69bd43e0534b&token={GENERATED_JWT_TOKEN}"\n  style="border:0;width:720px;aspect-ratio:16/9;max-width:100%;"\n  allow="autoplay,fullscreen"\n  allowfullscreen\n></iframe>',
      playerEmbedCode:
        '<iframe\n  src="https://player.vdocipher.com/live-v2?liveId=2606538097584602acfe69bd43e0534b&token={GENERATED_JWT_TOKEN}"\n  style="border:0;width:720px;aspect-ratio:16/9;max-width:100%;"\n  allow="autoplay,fullscreen"\n  allowfullscreen\n></iframe>',
    },
  });

  const handleClearField = (fieldName: keyof CreateLiveSessionFormValues) => {
    form.setValue(fieldName, "");
  };

  const courseId = form.watch("courseId");
  const sectionId = form.watch("sectionId");

  // Fetch sections when course is selected
  const { data: sectionsData } = useGetSectionsByCourse(courseId, {
    enabled: !!courseId,
  });

  // Fetch lessons when section is selected
  const { data: lessonsData } = useGetLessonsBySection(sectionId, {
    enabled: !!sectionId,
  });

  const sections = useMemo(
    () => (sectionsData?.data as any) || [],
    [sectionsData],
  );

  const lessons = useMemo(
    () => (lessonsData?.data as any) || [],
    [lessonsData],
  );

  const onSubmit = (values: CreateLiveSessionFormValues) => {
    createSession.mutate(
      {
        courseId: values.courseId,
        lessonId: values.lessonId,
        recordingTitle: values.recordingTitle,
        recordingDescription: values.recordingDescription,
        scheduledAt: values.scheduledAt || undefined,
        autoSaveRecording: values.autoSaveRecording,
        liveId: values.liveId,
        serverUrl: values.serverUrl,
        streamKey: values.streamKey,
        chatSecret: values.chatSecret as string,
        chatEmbedCode: values.chatEmbedCode as string,
        playerEmbedCode: values.playerEmbedCode as string,
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Live Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Live Session</DialogTitle>
          <DialogDescription>
            Set up a new live streaming session for your course. RTMP
            credentials will be generated.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            {/* Course Select */}
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Course *
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      form.setValue("sectionId", "");
                      form.setValue("lessonId", "");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Section Select */}
            {courseId && (
              <FormField
                control={form.control}
                name="sectionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">
                      Section *
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.setValue("lessonId", "");
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a section..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(sections as any[]).map((s: any) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Lesson Select */}
            {sectionId && (
              <FormField
                control={form.control}
                name="lessonId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">
                      Lesson *
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a lesson..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(lessons as any[]).map((l: any) => (
                          <SelectItem key={l._id} value={l._id}>
                            {l.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Recording Title */}
            <FormField
              control={form.control}
              name="recordingTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium flex flex-col">
                    <span className="font-bold text-red-400 w-full">
                      Important Notice :
                    </span>
                    Use the exact same title as in your VdoCipher Dashboard for
                    easier management and tracking
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. React Hooks Deep Dive - Live Session"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recording Description */}
            <FormField
              control={form.control}
              name="recordingDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description for the recording..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Schedule Date */}
            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Schedule (optional)
                  </FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Auto Save Toggle */}
            <FormField
              control={form.control}
              name="autoSaveRecording"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel className="text-xs font-medium">
                      Auto-Save Recording
                    </FormLabel>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Automatically save as lesson content when stream ends
                    </p>
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

            <div className="pt-4 border-t space-y-4">
              <h4 className="text-sm font-semibold">
                VdoCipher Stream Credentials
              </h4>
              <p className="text-xs text-muted-foreground">
                Create the stream in your VdoCipher Dashboard and paste the
                credentials here.
              </p>

              {/* Live ID */}
              <FormField
                control={form.control}
                name="liveId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">
                      Live ID *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1234abcd5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* RTMP Server URL */}
              <FormField
                control={form.control}
                name="serverUrl"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-medium">
                        RTMP Server URL *
                      </FormLabel>
                      {field.value && (
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => handleClearField("serverUrl")}
                          className="text-[10px] cursor-pointer text-muted-foreground hover:text-foreground underline"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <FormControl>
                      <Input placeholder="rtmp://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stream Key */}
              <FormField
                control={form.control}
                name="streamKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">
                      Stream Key *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter stream key"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chat Secret */}
                <FormField
                  control={form.control}
                  name="chatSecret"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-xs font-medium">
                        Chat Secret (Required)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Chat secret"
                          {...field}
                          value={(field.value as string) ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Player Embed Code */}
              <FormField
                control={form.control}
                name="playerEmbedCode"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-medium">
                        Live Player Embed Code (Required)
                      </FormLabel>
                      {field.value && (
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => handleClearField("playerEmbedCode")}
                          className="text-[10px] cursor-pointer text-muted-foreground hover:text-foreground underline"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <FormControl>
                      <Input placeholder="Player iframe code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Chat Embed Code */}
              <FormField
                control={form.control}
                name="chatEmbedCode"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-medium">
                        Chat Embed Code (Required)
                      </FormLabel>
                      {field.value && (
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => handleClearField("chatEmbedCode")}
                          className="text-[10px] cursor-pointer text-muted-foreground hover:text-foreground underline"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <FormControl>
                      <Input placeholder="Chat iframe code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit */}
            <div className="mt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={createSession.isPending}
              >
                {createSession.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Live Session"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
