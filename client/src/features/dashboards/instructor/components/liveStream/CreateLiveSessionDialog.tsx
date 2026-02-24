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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import {
  ICourse,
  useGetSectionsByCourse,
  useGetLessonsBySection,
} from "@/services/courses";
import { useCreateLiveSession } from "@/services/liveStream";
import { useState, useMemo } from "react";

interface CreateLiveSessionDialogProps {
  courses: ICourse[];
}

export function CreateLiveSessionDialog({
  courses,
}: CreateLiveSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [recordingTitle, setRecordingTitle] = useState("");
  const [recordingDescription, setRecordingDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [autoSaveRecording, setAutoSaveRecording] = useState(true);

  // Manual Credentials
  const [liveId, setLiveId] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const [chatSecret, setChatSecret] = useState("");
  const [chatEmbedCode, setChatEmbedCode] = useState("");
  const [playerEmbedCode, setPlayerEmbedCode] = useState("");

  const createSession = useCreateLiveSession();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !courseId ||
      !lessonId ||
      !recordingTitle ||
      !liveId ||
      !serverUrl ||
      !streamKey
    )
      return;

    createSession.mutate(
      {
        courseId,
        lessonId,
        recordingTitle,
        recordingDescription: recordingDescription || undefined,
        scheduledAt: scheduledAt || undefined,
        autoSaveRecording,
        liveId,
        serverUrl,
        streamKey,
        chatSecret: chatSecret || undefined,
        chatEmbedCode: chatEmbedCode || undefined,
        playerEmbedCode: playerEmbedCode || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          resetForm();
        },
      },
    );
  };

  const resetForm = () => {
    setCourseId("");
    setSectionId("");
    setLessonId("");
    setRecordingTitle("");
    setRecordingDescription("");
    setScheduledAt("");
    setAutoSaveRecording(true);
    setLiveId("");
    setServerUrl("");
    setStreamKey("");
    setChatSecret("");
    setChatEmbedCode("");
    setPlayerEmbedCode("");
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

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Course Select */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Course *</Label>
            <Select
              value={courseId}
              onValueChange={(v) => {
                setCourseId(v);
                setSectionId("");
                setLessonId("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course..." />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section Select */}
          {courseId && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Section *</Label>
              <Select
                value={sectionId}
                onValueChange={(v) => {
                  setSectionId(v);
                  setLessonId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a section..." />
                </SelectTrigger>
                <SelectContent>
                  {(sections as any[]).map((s: any) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Lesson Select */}
          {sectionId && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Lesson *</Label>
              <Select value={lessonId} onValueChange={setLessonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a lesson..." />
                </SelectTrigger>
                <SelectContent>
                  {(lessons as any[]).map((l: any) => (
                    <SelectItem key={l._id} value={l._id}>
                      {l.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Recording Title */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Recording Title *</Label>
            <Input
              value={recordingTitle}
              onChange={(e) => setRecordingTitle(e.target.value)}
              placeholder="e.g. React Hooks Deep Dive - Live Session"
              required
            />
          </div>

          {/* Recording Description */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Description</Label>
            <Textarea
              value={recordingDescription}
              onChange={(e) => setRecordingDescription(e.target.value)}
              placeholder="Optional description for the recording..."
              rows={2}
            />
          </div>

          {/* Schedule Date */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Schedule (optional)</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>

          {/* Auto Save Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="text-xs font-medium">Auto-Save Recording</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically save as lesson content when stream ends
              </p>
            </div>
            <Switch
              checked={autoSaveRecording}
              onCheckedChange={setAutoSaveRecording}
            />
          </div>

          <div className="pt-4 border-t space-y-4">
            <h4 className="text-sm font-semibold">
              VdoCipher Stream Credentials
            </h4>
            <p className="text-xs text-muted-foreground">
              Create the stream in your VdoCipher Dashboard and paste the
              credentials here.
            </p>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Live ID *</Label>
              <Input
                value={liveId}
                onChange={(e) => setLiveId(e.target.value)}
                placeholder="e.g. 1234abcd5678"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">RTMP Server URL *</Label>
              <Input
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="rtmp://..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Stream Key *</Label>
              <Input
                type="password"
                value={streamKey}
                onChange={(e) => setStreamKey(e.target.value)}
                placeholder="Enter stream key"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Live Player Embed Code (Optional)
                </Label>
                <Input
                  value={playerEmbedCode}
                  onChange={(e) => setPlayerEmbedCode(e.target.value)}
                  placeholder="Player iframe code"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Chat Embed Code (Optional)
                </Label>
                <Input
                  value={chatEmbedCode}
                  onChange={(e) => setChatEmbedCode(e.target.value)}
                  placeholder="Chat iframe code"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-medium">
                  Chat Secret (Optional)
                </Label>
                <Input
                  type="password"
                  value={chatSecret}
                  onChange={(e) => setChatSecret(e.target.value)}
                  placeholder="Chat secret"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full mt-2"
            disabled={
              !courseId ||
              !lessonId ||
              !recordingTitle ||
              !liveId ||
              !serverUrl ||
              !streamKey ||
              createSession.isPending
            }
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
