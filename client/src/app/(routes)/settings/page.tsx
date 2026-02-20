"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useGetPreferences,
  useUpdateAppearancePreferences,
  useUpdateEmailPreferences,
  useUpdateNotificationPreferences,
  useUpdatePrivacyPreferences,
  useUpdateRegionalPreferences,
  useUpdateSecurityPreferences,
} from "@/services/preferences";
import { useAuthStore } from "@/store/auth";
import {
  Bell,
  Globe,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Palette,
  Shield,
  Smartphone,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Common timezones
const TIMEZONES = [
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "America/New_York", label: "New York (EST)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  if (!user) {
    router.push("/");
    return null;
  }
  const { data, isLoading, isError } = useGetPreferences(user?.id || "");
  const { mutate: updateEmail, isPending: isUpdatingEmail } =
    useUpdateEmailPreferences();
  const { mutate: updateSecurity, isPending: isUpdatingSecurity } =
    useUpdateSecurityPreferences();
  const { mutate: updateNotification, isPending: isUpdatingNotification } =
    useUpdateNotificationPreferences();
  const { mutate: updateAppearance, isPending: isUpdatingAppearance } =
    useUpdateAppearancePreferences();
  const { mutate: updateRegional, isPending: isUpdatingRegional } =
    useUpdateRegionalPreferences();
  const { mutate: updatePrivacy, isPending: isUpdatingPrivacy } =
    useUpdatePrivacyPreferences();

  const preferences = data?.data;

  const isUpdating =
    isUpdatingEmail ||
    isUpdatingSecurity ||
    isUpdatingNotification ||
    isUpdatingAppearance ||
    isUpdatingRegional ||
    isUpdatingPrivacy;

  const handleEmailToggle = (
    key: "marketing" | "courseUpdates" | "loginNotification",
  ) => {
    if (!preferences?.email) return;
    updateEmail({
      [key]: !preferences.email[key],
    });
  };

  const handleSecurityToggle = (key: "twoFactorEnabled") => {
    if (!preferences?.security) return;
    updateSecurity({
      [key]: !preferences.security[key],
    });
  };

  const handleNotificationToggle = (key: "push" | "sms" | "inApp") => {
    if (!preferences?.notifications) return;
    updateNotification({
      [key]: !preferences.notifications[key],
    });
  };

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    updateAppearance({ theme });
  };

  const handleLanguageChange = (language: string) => {
    updateAppearance({ language });
  };

  const handleTimezoneChange = (timezone: string) => {
    updateRegional({ timezone });
  };

  const handlePrivacyToggle = (
    key: "shareProfile" | "showActivity" | "allowAnalytics",
  ) => {
    if (!preferences?.privacy) return;
    updatePrivacy({
      [key]: !preferences.privacy[key],
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !preferences) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            Failed to load preferences. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and notification settings
        </p>
      </div>

      {/* Email Preferences */}
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
              checked={preferences.email?.marketing}
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
              checked={preferences.email?.courseUpdates}
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
              checked={preferences.email?.loginNotification}
              onCheckedChange={() => handleEmailToggle("loginNotification")}
              disabled={isUpdatingEmail}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
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
              <Label
                htmlFor="twoFactorEnabled"
                className="text-base font-medium"
              >
                Two-Factor Authentication (2FA)
              </Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
              {preferences.security?.twoFactorEnabled && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xs text-green-600 font-medium">Active</p>
                </div>
              )}
            </div>
            <Switch
              id="twoFactorEnabled"
              checked={preferences.security?.twoFactorEnabled}
              onCheckedChange={() => handleSecurityToggle("twoFactorEnabled")}
              disabled={isUpdatingSecurity}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
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
              checked={preferences.notifications?.push}
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
              checked={preferences.notifications?.sms}
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
              checked={preferences.notifications?.inApp}
              onCheckedChange={() => handleNotificationToggle("inApp")}
              disabled={isUpdatingNotification}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Appearance Settings</CardTitle>
          </div>
          <CardDescription>
            Customize how the application looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="theme" className="text-base font-medium">
              Theme
            </Label>
            <Select
              value={preferences.appearance?.theme}
              onValueChange={(value) =>
                handleThemeChange(value as "light" | "dark" | "system")
              }
              disabled={isUpdatingAppearance}
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System Default</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose your preferred color scheme
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label htmlFor="language" className="text-base font-medium">
              Language
            </Label>
            <Select
              value={preferences.appearance?.language}
              onValueChange={handleLanguageChange}
              disabled={isUpdatingAppearance}
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Select your preferred language
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Regional Settings</CardTitle>
          </div>
          <CardDescription>
            Configure your region-specific preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="timezone" className="text-base font-medium">
              Timezone
            </Label>
            <Select
              value={preferences.regional?.timezone}
              onValueChange={handleTimezoneChange}
              disabled={isUpdatingRegional}
            >
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Your timezone affects how dates and times are displayed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
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
              checked={preferences.privacy?.shareProfile}
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
              checked={preferences.privacy?.showActivity}
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
              checked={preferences.privacy?.allowAnalytics}
              onCheckedChange={() => handlePrivacyToggle("allowAnalytics")}
              disabled={isUpdatingPrivacy}
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading Indicator */}
      {isUpdating && (
        <div className="fixed bottom-4 right-4 bg-background border shadow-lg rounded-lg p-4 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm">Updating preferences...</p>
        </div>
      )}
    </div>
  );
}
