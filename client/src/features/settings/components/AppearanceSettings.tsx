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
import { useUpdateAppearancePreferences } from "@/services/preferences";
import { Palette } from "lucide-react";
import type { IAppearancePreferences } from "@/services/preferences/types";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
];

interface AppearanceSettingsProps {
  appearancePreferences?: IAppearancePreferences;
}

export default function AppearanceSettings({
  appearancePreferences,
}: AppearanceSettingsProps) {
  const { mutate: updateAppearance, isPending: isUpdatingAppearance } =
    useUpdateAppearancePreferences();

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    updateAppearance({ theme });
  };

  const handleLanguageChange = (language: string) => {
    updateAppearance({ language });
  };

  return (
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
            value={appearancePreferences?.theme}
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
            value={appearancePreferences?.language}
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
  );
}
