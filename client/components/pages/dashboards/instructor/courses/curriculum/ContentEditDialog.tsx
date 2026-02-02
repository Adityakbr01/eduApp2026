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
import { Switch } from "@/components/ui/switch";
import LessonVideoUpload from "@/lib/s3/LessonVideoUpload";
import { ContentType } from "@/services/courses";
import { Loader2 } from "lucide-react";


type EditContentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  content: any;
  courseId: string;
  lessonId: string;

  editTitle: string;
  setEditTitle: (v: string) => void;

  editMarks: number;
  setEditMarks: (v: number) => void;

  editIsPreview: boolean;
  setEditIsPreview: (v: boolean) => void;

  editMinWatchPercent: number;
  setEditMinWatchPercent: (v: number) => void;

  isLoading: boolean;
  isUploading: boolean;
  isVideoUploadDisabled: boolean;

  newFileKey: string | null;
  setNewFileKey: (v: string | null) => void;

  getCurrentFileUrl: () => string | undefined;

  handleSave: () => void;
  setIsUploading: (v: boolean) => void;
};

export function EditContentDialog({
  open,
  onOpenChange,
  content,
  courseId,
  lessonId,

  editTitle,
  setEditTitle,

  editMarks,
  setEditMarks,

  editIsPreview,
  setEditIsPreview,

  editMinWatchPercent,
  setEditMinWatchPercent,

  isLoading,
  isUploading,
  isVideoUploadDisabled,

  newFileKey,
  setNewFileKey,

  getCurrentFileUrl,
  handleSave,
  setIsUploading,
}: EditContentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Content</DialogTitle>
          <DialogDescription>
            Update details or replace the file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Marks + Preview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Marks</Label>
              <Input
                type="number"
                min={0}
                value={editMarks}
                onChange={(e) =>
                  setEditMarks(parseInt(e.target.value) || 0)
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Free Preview</Label>
              <div className="flex items-center gap-2 h-10">
                <Switch
                  checked={editIsPreview}
                  onCheckedChange={setEditIsPreview}
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground">
                  {editIsPreview ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Current file */}
          {getCurrentFileUrl() && !newFileKey && (
            <div className="space-y-2">
              <Label>Current File</Label>
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
              <Label>Replace File</Label>

              {content.type === ContentType.VIDEO && (
                <LessonVideoUpload
                  courseId={courseId}
                  lessonId={lessonId}
                  lessonContentId={content._id}
                  disabled={isVideoUploadDisabled}
                  onUploadStateChange={(uploading) => {
                    setIsUploading(uploading);
                  }}
                  onUploaded={(key) => {
                    setNewFileKey(key);
                  }}
                />
              )}

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
          {(content.type === ContentType.VIDEO ||
            content.type === ContentType.AUDIO) &&
            content.type === ContentType.VIDEO && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Watch %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={editMinWatchPercent}
                    onChange={(e) =>
                      setEditMinWatchPercent(+e.target.value || 90)
                    }
                  />
                </div>
              </div>
            )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={isUploading || isLoading || !editTitle.trim()}
          >
            {isLoading || isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
