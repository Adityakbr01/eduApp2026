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
import { useUpdateEmailPreferences } from "@/services/preferences";
import { Mail } from "lucide-react";
import type { IEmailPreferences } from "@/services/preferences/types";

interface EmailPreferencesProps {
  emailPreferences?: IEmailPreferences;
}

export default function EmailPreferences({
  emailPreferences,
}: EmailPreferencesProps) {
  const { mutate: updateEmail, isPending: isUpdatingEmail } =
    useUpdateEmailPreferences();

  const handleEmailToggle = (
    key: "marketing" | "courseUpdates" | "loginNotification",
  ) => {
    if (!emailPreferences) return;
    updateEmail({
      [key]: !emailPreferences[key],
    });
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle>Email Preferences</CardTitle>
        </div>
        <CardDescription>
          Control which email notifications you receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="marketing" className="text-base font-medium">
              Marketing Emails
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about new courses, promotions, and special offers
            </p>
          </div>
          <Switch
            id="marketing"
            checked={emailPreferences?.marketing}
            onCheckedChange={() => handleEmailToggle("marketing")}
            disabled={isUpdatingEmail}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="courseUpdates" className="text-base font-medium">
              Course Updates
            </Label>
            <p className="text-sm text-muted-foreground">
              Get notified about updates to your enrolled courses
            </p>
          </div>
          <Switch
            id="courseUpdates"
            checked={emailPreferences?.courseUpdates}
            onCheckedChange={() => handleEmailToggle("courseUpdates")}
            disabled={isUpdatingEmail}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label
              htmlFor="loginNotification"
              className="text-base font-medium"
            >
              Login Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive an email when someone logs into your account
            </p>
          </div>
          <Switch
            id="loginNotification"
            checked={emailPreferences?.loginNotification}
            onCheckedChange={() => handleEmailToggle("loginNotification")}
            disabled={isUpdatingEmail}
          />
        </div>
      </CardContent>
    </Card>
  );
}
