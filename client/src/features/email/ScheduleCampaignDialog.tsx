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
import { useState } from "react";
import toast from "react-hot-toast";

interface ScheduleCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string | null;
  onSchedule: (id: string, scheduledAt: string) => void;
  isScheduling: boolean;
}

export function ScheduleCampaignDialog({
  isOpen,
  onClose,
  campaignId,
  onSchedule,
  isScheduling,
}: ScheduleCampaignDialogProps) {
  const [scheduledAt, setScheduledAt] = useState("");

  const handleScheduleClick = () => {
    if (!campaignId) return;

    if (!scheduledAt) {
      toast.error("Please select a valid date and time.");
      return;
    }

    const selectedDate = new Date(scheduledAt);
    if (selectedDate <= new Date()) {
      toast.error("Scheduled time must be in the future.");
      return;
    }

    onSchedule(campaignId, selectedDate.toISOString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Campaign</DialogTitle>
          <DialogDescription>
            Choose a date and time for when this campaign should be queued to
            send automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Date & Time</label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isScheduling}>
            Cancel
          </Button>
          <Button onClick={handleScheduleClick} disabled={isScheduling}>
            {isScheduling ? "Scheduling..." : "Schedule Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
