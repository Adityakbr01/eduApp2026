"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { requestFirebaseNotificationPermission } from "@/lib/firebase";
import {
  useRegisterPushToken,
  useUpdateNotificationPreferences,
} from "@/services/preferences";
import type { INotificationPreferences } from "@/services/preferences/types";
import { Bell, MessageSquare, Smartphone } from "lucide-react";
import toast from "react-hot-toast";

interface NotificationPreferencesProps {
  notificationPreferences?: INotificationPreferences;
}

export default function NotificationPreferences({
  notificationPreferences,
}: NotificationPreferencesProps) {
  const { mutate: updateNotification, isPending: isUpdatingNotification } =
    useUpdateNotificationPreferences();
  const { mutate: registerPushToken } = useRegisterPushToken();

  const handleNotificationToggle = async (key: "push" | "sms" | "inApp") => {
    if (!notificationPreferences) return;

    const newValue = !notificationPreferences[key];

    // If turning on push notifications, attempt to register token
    if (key === "push" && newValue) {
      if (!("Notification" in window)) {
        toast.error("Push notifications are not supported by this browser.");
        return;
      }

      try {
        const token = await requestFirebaseNotificationPermission();
        if (token) {
          // Register token silently (no separate toast — updateNotification below will show one)
          registerPushToken({ token, platform: "web" });
        } else {
          toast.error(
            "Could not enable push notifications. Permission may have been denied.",
          );
          return;
        }
      } catch (error) {
        // Show Brave-specific or generic error
        const message =
          error instanceof Error
            ? error.message
            : "Failed to enable push notifications.";
        toast.error(message);
        return;
      }
    }

    updateNotification({
      [key]: newValue,
    });
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Notification Preferences</CardTitle>
        </div>
        <CardDescription>
          Choose how you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="push" className="text-base font-medium">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Push Notifications
              </div>
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications on your devices
            </p>
          </div>
          <Switch
            id="push"
            checked={notificationPreferences?.push}
            onCheckedChange={() => handleNotificationToggle("push")}
            disabled={isUpdatingNotification}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="sms" className="text-base font-medium">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS Notifications
              </div>
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive text messages for important updates
            </p>
          </div>
          <Switch
            id="sms"
            checked={notificationPreferences?.sms}
            onCheckedChange={() => handleNotificationToggle("sms")}
            disabled={isUpdatingNotification}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="inApp" className="text-base font-medium">
              In-App Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              See notifications while using the app
            </p>
          </div>
          <Switch
            id="inApp"
            checked={notificationPreferences?.inApp}
            onCheckedChange={() => handleNotificationToggle("inApp")}
            disabled={isUpdatingNotification}
          />
        </div>
      </CardContent>
    </Card>
  );
}
