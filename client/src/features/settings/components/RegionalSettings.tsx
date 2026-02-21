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
import { useUpdateRegionalPreferences } from "@/services/preferences";
import { Globe } from "lucide-react";
import type { IRegionalPreferences } from "@/services/preferences/types";

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

interface RegionalSettingsProps {
  regionalPreferences?: IRegionalPreferences;
}

export default function RegionalSettings({
  regionalPreferences,
}: RegionalSettingsProps) {
  const { mutate: updateRegional, isPending: isUpdatingRegional } =
    useUpdateRegionalPreferences();

  const handleTimezoneChange = (timezone: string) => {
    updateRegional({ timezone });
  };

  return (
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
            value={regionalPreferences?.timezone}
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
  );
}
