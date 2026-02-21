"use client";
import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  AppearanceSettings,
  EmailPreferences,
  NotificationPreferences,
  PrivacySettings,
  RegionalSettings,
  SecuritySettings,
} from "@/features/settings/components";
import { useGetPreferences } from "@/services/preferences";
import { useAuthStore } from "@/store/auth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) {
      router.push("/");
    }
  }, [user, hydrated, router]);

  const { data, isLoading, isError } = useGetPreferences(user?.id || "");

  if (!hydrated) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const preferences = data?.data;

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

      <EmailPreferences emailPreferences={preferences.email} />
      <SecuritySettings securityPreferences={preferences.security} />
      <NotificationPreferences
        notificationPreferences={
          preferences.notifications ?? { push: false, sms: false, inApp: true }
        }
      />
      <AppearanceSettings appearancePreferences={preferences.appearance} />
      <RegionalSettings
        regionalPreferences={
          preferences.regional ?? { timezone: "Asia/Kolkata" }
        }
      />
      <PrivacySettings
        privacyPreferences={
          preferences.privacy ?? {
            shareProfile: true,
            showActivity: true,
            allowAnalytics: true,
          }
        }
      />
    </div>
  );
}
