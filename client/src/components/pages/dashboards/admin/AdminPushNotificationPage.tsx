"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiClient from "@/lib/api/axios";
import toast from "react-hot-toast";
import {
  Bell,
  Clock,
  Loader2,
  Send,
  Zap,
  Globe,
  Smartphone,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

const PUSH_NOTIFICATIONS_PATH = "/notifications/push";

const PLATFORMS = [
  { id: "web", label: "Web", icon: Globe },
  { id: "android", label: "Android", icon: Smartphone },
  { id: "ios", label: "iOS", icon: Smartphone },
];

export default function AdminPushNotificationPage() {
  // Immediate send state
  const [sendIsAll, setSendIsAll] = useState(false);
  const [sendUserId, setSendUserId] = useState("");
  const [sendTitle, setSendTitle] = useState("");
  const [sendBody, setSendBody] = useState("");
  const [sendPlatforms, setSendPlatforms] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Schedule state
  const [scheduleIsAll, setScheduleIsAll] = useState(false);
  const [scheduleUserId, setScheduleUserId] = useState("");
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleBody, setScheduleBody] = useState("");
  const [schedulePlatforms, setSchedulePlatforms] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<"delay" | "cron">("delay");
  const [delayMinutes, setDelayMinutes] = useState("");
  const [cronExpression, setCronExpression] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  const togglePlatform = (platformId: string, isSchedule: boolean) => {
    if (isSchedule) {
      setSchedulePlatforms((prev) =>
        prev.includes(platformId)
          ? prev.filter((p) => p !== platformId)
          : [...prev, platformId],
      );
    } else {
      setSendPlatforms((prev) =>
        prev.includes(platformId)
          ? prev.filter((p) => p !== platformId)
          : [...prev, platformId],
      );
    }
  };

  const handleSendImmediate = async () => {
    if (
      (!sendIsAll && !sendUserId.trim()) ||
      !sendTitle.trim() ||
      !sendBody.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSending(true);
    try {
      if (sendIsAll) {
        await apiClient.post(`${PUSH_NOTIFICATIONS_PATH}/send-all`, {
          title: sendTitle.trim(),
          body: sendBody.trim(),
          targetPlatforms: sendPlatforms.length > 0 ? sendPlatforms : undefined,
        });
      } else {
        await apiClient.post(`${PUSH_NOTIFICATIONS_PATH}/send`, {
          userId: sendUserId.trim(),
          title: sendTitle.trim(),
          body: sendBody.trim(),
        });
      }
      toast.success("Push notification sent successfully!");
      setSendTitle("");
      setSendBody("");
      setSendUserId("");
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message || "Failed to send notification.";
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleSchedule = async () => {
    if (
      !scheduleUserId.trim() ||
      !scheduleTitle.trim() ||
      !scheduleBody.trim()
    ) {
      toast.error("Please fill in User ID, Title, and Body.");
      return;
    }

    if (scheduleType === "delay" && !delayMinutes) {
      toast.error("Please enter delay in minutes.");
      return;
    }
    if (scheduleType === "cron" && !cronExpression.trim()) {
      toast.error("Please enter a valid cron expression.");
      return;
    }

    setIsScheduling(true);
    try {
      await apiClient.post(`${PUSH_NOTIFICATIONS_PATH}/schedule`, {
        userId: scheduleIsAll ? undefined : scheduleUserId.trim(),
        title: scheduleTitle.trim(),
        body: scheduleBody.trim(),
        isSendToAll: scheduleIsAll,
        targetPlatforms:
          scheduleIsAll && schedulePlatforms.length > 0
            ? schedulePlatforms
            : undefined,
        ...(scheduleType === "delay"
          ? { delayMs: parseInt(delayMinutes) * 60_000 }
          : { cron: cronExpression.trim() }),
      });
      toast.success("Push notification scheduled successfully!");
      setScheduleTitle("");
      setScheduleBody("");
      setScheduleUserId("");
      setDelayMinutes("");
      setCronExpression("");
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        "Failed to schedule notification.";
      toast.error(msg);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Push Notifications
          </h2>
          <p className="text-muted-foreground mt-1">
            Send instant or scheduled push notifications to users.
          </p>
        </div>
      </div>

      <Tabs defaultValue="immediate" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="immediate" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Send Now
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Schedule
          </TabsTrigger>
        </TabsList>

        {/* ===== IMMEDIATE SEND TAB ===== */}
        <TabsContent value="immediate" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                <CardTitle>Send Immediate Notification</CardTitle>
              </div>
              <CardDescription>
                Deliver a push notification to a specific user or all users
                right away.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center space-x-2 pb-2">
                <Switch
                  id="send-all-users"
                  checked={sendIsAll}
                  onCheckedChange={setSendIsAll}
                />
                <Label
                  htmlFor="send-all-users"
                  className="font-semibold cursor-pointer"
                >
                  Send to ALL subscibed users
                </Label>
              </div>

              {!sendIsAll && (
                <div className="space-y-2">
                  <Label htmlFor="send-userId">
                    Target User ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="send-userId"
                    placeholder="Enter the target user's ID"
                    value={sendUserId}
                    onChange={(e) => setSendUserId(e.target.value)}
                  />
                </div>
              )}

              {sendIsAll && (
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                  <Label>Filter by Platform (Optional)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    If none selected, sends to all available platforms.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {PLATFORMS.map((platform) => (
                      <div
                        key={`send-${platform.id}`}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`send-${platform.id}`}
                          checked={sendPlatforms.includes(platform.id)}
                          onCheckedChange={() =>
                            togglePlatform(platform.id, false)
                          }
                        />
                        <Label
                          htmlFor={`send-${platform.id}`}
                          className="flex items-center gap-1 cursor-pointer"
                        >
                          <platform.icon className="h-4 w-4 text-muted-foreground" />
                          {platform.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-2" />

              <div className="space-y-2">
                <Label htmlFor="send-title">
                  Notification Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="send-title"
                  placeholder="e.g. New Course Available!"
                  value={sendTitle}
                  onChange={(e) => setSendTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="send-body">Notification Body</Label>
                <Textarea
                  id="send-body"
                  placeholder="e.g. Check out our latest course on React 19..."
                  value={sendBody}
                  onChange={(e) => setSendBody(e.target.value)}
                  rows={3}
                />
              </div>

              <Separator />

              <Button
                onClick={handleSendImmediate}
                disabled={isSending}
                className="w-full sm:w-auto"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isSending ? "Sending..." : "Send Notification"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== SCHEDULE TAB ===== */}
        <TabsContent value="schedule" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle>Schedule Notification</CardTitle>
              </div>
              <CardDescription>
                Set up a delayed or recurring push notification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center space-x-2 pb-2">
                <Switch
                  id="schedule-all-users"
                  checked={scheduleIsAll}
                  onCheckedChange={setScheduleIsAll}
                />
                <Label
                  htmlFor="schedule-all-users"
                  className="font-semibold cursor-pointer"
                >
                  Schedule for ALL subscibed users
                </Label>
              </div>

              {!scheduleIsAll && (
                <div className="space-y-2">
                  <Label htmlFor="schedule-userId">
                    Target User ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="schedule-userId"
                    placeholder="Enter the target user's ID"
                    value={scheduleUserId}
                    onChange={(e) => setScheduleUserId(e.target.value)}
                  />
                </div>
              )}

              {scheduleIsAll && (
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                  <Label>Filter by Platform (Optional)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    If none selected, sends to all available platforms.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {PLATFORMS.map((platform) => (
                      <div
                        key={`schedule-${platform.id}`}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`schedule-${platform.id}`}
                          checked={schedulePlatforms.includes(platform.id)}
                          onCheckedChange={() =>
                            togglePlatform(platform.id, true)
                          }
                        />
                        <Label
                          htmlFor={`schedule-${platform.id}`}
                          className="flex items-center gap-1 cursor-pointer"
                        >
                          <platform.icon className="h-4 w-4 text-muted-foreground" />
                          {platform.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-2" />

              <div className="space-y-2">
                <Label htmlFor="schedule-title">
                  Notification Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="schedule-title"
                  placeholder="e.g. Reminder: Complete your assignment"
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule-body">Notification Body</Label>
                <Textarea
                  id="schedule-body"
                  placeholder="e.g. Your assignment is due in 24 hours..."
                  value={scheduleBody}
                  onChange={(e) => setScheduleBody(e.target.value)}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Schedule Type</Label>
                <Select
                  value={scheduleType}
                  onValueChange={(v) => setScheduleType(v as "delay" | "cron")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delay">
                      One-time Delay (minutes)
                    </SelectItem>
                    <SelectItem value="cron">
                      Recurring (Cron Expression)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {scheduleType === "delay" ? (
                <div className="space-y-2">
                  <Label htmlFor="delay-minutes">Delay (minutes)</Label>
                  <Input
                    id="delay-minutes"
                    type="number"
                    min={1}
                    placeholder="e.g. 30"
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Notification will be sent after this many minutes.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="cron-expression">Cron Expression</Label>
                  <Input
                    id="cron-expression"
                    placeholder="e.g. 0 9 * * 1 (Every Monday at 9 AM)"
                    value={cronExpression}
                    onChange={(e) => setCronExpression(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Standard cron format: minute hour day month weekday
                  </p>
                </div>
              )}

              <Separator />

              <Button
                onClick={handleSchedule}
                disabled={isScheduling}
                className="w-full sm:w-auto"
              >
                {isScheduling ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Clock className="h-4 w-4 mr-2" />
                )}
                {isScheduling ? "Scheduling..." : "Schedule Notification"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
