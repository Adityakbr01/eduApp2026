"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUpdateSecurityPreferences } from "@/services/preferences";
import { Shield } from "lucide-react";
import type { ISecurityPreferences } from "@/services/preferences/types";

interface SecuritySettingsProps {
  securityPreferences?: ISecurityPreferences;
}

export default function SecuritySettings({
  securityPreferences,
}: SecuritySettingsProps) {
  const { mutate: updateSecurity, isPending: isUpdatingSecurity } =
    useUpdateSecurityPreferences();

  const handleSecurityToggle = (key: "twoFactorEnabled") => {
    if (!securityPreferences) return;
    updateSecurity({
      [key]: !securityPreferences[key],
    });
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Security Settings</CardTitle>
        </div>
        <CardDescription>
          Manage your account security preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="twoFactorEnabled" className="text-base font-medium">
              Two-Factor Authentication (2FA)
            </Label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
            {securityPreferences?.twoFactorEnabled && (
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs text-green-600 font-medium">Active</p>
              </div>
            )}
          </div>
          <Switch
            id="twoFactorEnabled"
            checked={securityPreferences?.twoFactorEnabled}
            onCheckedChange={() => handleSecurityToggle("twoFactorEnabled")}
            disabled={isUpdatingSecurity}
          />
        </div>
      </CardContent>
    </Card>
  );
}
