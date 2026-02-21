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
import { useUpdatePrivacyPreferences } from "@/services/preferences";
import type { IPrivacyPreferences } from "@/services/preferences/types";
import { Lock } from "lucide-react";

interface PrivacySettingsProps {
  privacyPreferences?: IPrivacyPreferences;
}

export default function PrivacySettings({
  privacyPreferences,
}: PrivacySettingsProps) {
  const { mutate: updatePrivacy, isPending: isUpdatingPrivacy } =
    useUpdatePrivacyPreferences();

  const handlePrivacyToggle = (
    key: "shareProfile" | "showActivity" | "allowAnalytics",
  ) => {
    if (!privacyPreferences) return;
    updatePrivacy({
      [key]: !privacyPreferences[key],
    });
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <CardTitle>Privacy Settings</CardTitle>
        </div>
        <CardDescription>
          Control your privacy and data sharing preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="shareProfile" className="text-base font-medium">
              Share Profile
            </Label>
            <p className="text-sm text-muted-foreground">
              Allow others to view your profile information
            </p>
          </div>
          <Switch
            id="shareProfile"
            checked={privacyPreferences?.shareProfile}
            onCheckedChange={() => handlePrivacyToggle("shareProfile")}
            disabled={isUpdatingPrivacy}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="showActivity" className="text-base font-medium">
              Show Activity
            </Label>
            <p className="text-sm text-muted-foreground">
              Display your recent activity to others
            </p>
          </div>
          <Switch
            id="showActivity"
            checked={privacyPreferences?.showActivity}
            onCheckedChange={() => handlePrivacyToggle("showActivity")}
            disabled={isUpdatingPrivacy}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="allowAnalytics" className="text-base font-medium">
              Allow Analytics
            </Label>
            <p className="text-sm text-muted-foreground">
              Help us improve by sharing anonymous usage data
            </p>
          </div>
          <Switch
            id="allowAnalytics"
            checked={privacyPreferences?.allowAnalytics}
            onCheckedChange={() => handlePrivacyToggle("allowAnalytics")}
            disabled={isUpdatingPrivacy}
          />
        </div>
      </CardContent>
    </Card>
  );
}
