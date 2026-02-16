"use client";

import NotificationForm from "@/components/form/NotificationSection/NotificationForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import getLevelBadge from "@/lib/utils/getLevelBadge";
import {
  NotificationService,
  type Notification,
} from "@/services/classroom/notification.service";
import { ICourse } from "@/services/courses";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { formatTimeAgo } from "./utils";

interface NotificationsSectionProps {
  courses: ICourse[];
}

export function NotificationsSection({ courses }: NotificationsSectionProps) {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch Sent Notifications
  const { data, isLoading } = useQuery({
    queryKey: ["instructor-notifications", page],
    queryFn: () => NotificationService.getSentNotifications(page),
  });

  const notifications = data?.data?.items || [];

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: NotificationService.sendNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-notifications"] });
      setIsCreateOpen(false);
      toast.success("Notification sent successfully");
    },
    onError: () => toast.error("Failed to send notification"),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: NotificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-notifications"] });
      toast.success("Notification deleted");
    },
    onError: () => toast.error("Failed to delete notification"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Manage and send notifications to your students.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <NotificationForm
              courses={courses}
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <Bell className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="text-muted-foreground">No notifications sent yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notifications.map((notification: Notification) => (
            <div
              key={notification._id}
              className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-card/80  transition-colors"
            >
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${getLevelBadge(
                      notification.level,
                    )}`}
                  >
                    {notification.level}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(new Date(notification.createdAt))}
                  </span>
                </div>
                <h3 className="font-semibold">{notification.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
                {notification.courseId && (
                  <span className="text-xs text-muted-foreground">
                    Course ID: {notification.courseId}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("Delete this notification?")) {
                      deleteMutation.mutate(notification._id);
                    }
                  }}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
