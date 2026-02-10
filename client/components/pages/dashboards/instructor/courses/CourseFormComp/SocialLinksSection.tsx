"use client";

import {
  Plus,
  Trash2,
  Github,
  Globe,
  Youtube,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import { UseFormReturn, useFieldArray } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SocialLinkType } from "@/services/courses";
import { CreateCourseInput } from "@/validators/course.schema";

// Custom Discord Icon
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

// Platform config with icons, colors, and placeholder URLs
const PLATFORM_CONFIG: Record<
  SocialLinkType,
  {
    icon: React.ReactNode;
    label: string;
    color: string;
    badgeColor: string;
    placeholder: string;
  }
> = {
  [SocialLinkType.DISCORD]: {
    icon: <DiscordIcon className="w-4 h-4" />,
    label: "Discord",
    color: "text-[#5865F2]",
    badgeColor:
      "text-[#5865F2] bg-[#5865F2]/10 border-[#5865F2]/20 hover:bg-[#5865F2]/20",
    placeholder: "https://discord.gg/your-server",
  },
  [SocialLinkType.GITHUB]: {
    icon: <Github className="w-4 h-4" />,
    label: "GitHub",
    color: "text-gray-900 dark:text-gray-100",
    badgeColor:
      "text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700",
    placeholder: "https://github.com/your-repo",
  },
  [SocialLinkType.YOUTUBE]: {
    icon: <Youtube className="w-4 h-4" />,
    label: "YouTube",
    color: "text-red-600",
    badgeColor:
      "text-red-600 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900",
    placeholder: "https://youtube.com/@your-channel",
  },
  [SocialLinkType.WEBSITE]: {
    icon: <Globe className="w-4 h-4" />,
    label: "Website",
    color: "text-blue-600",
    badgeColor:
      "text-blue-600 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900",
    placeholder: "https://your-website.com",
  },
  [SocialLinkType.OTHER]: {
    icon: <ExternalLink className="w-4 h-4" />,
    label: "Other",
    color: "text-gray-500",
    badgeColor:
      "text-gray-500 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800",
    placeholder: "https://example.com/link",
  },
};

interface SocialLinksSectionProps {
  form: UseFormReturn<CreateCourseInput>;
}

export function SocialLinksSection({ form }: SocialLinksSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  const handleAddLink = () => {
    append({
      type: SocialLinkType.DISCORD,
      url: "",
      isPublic: true,
    });
  };

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Social & Community Links
            </CardTitle>
            <CardDescription>
              Add Discord, GitHub, YouTube, or website links for your students
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddLink}
            className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {fields.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
            <div className="flex items-center gap-3 mb-4">
              {Object.values(SocialLinkType).map((type) => (
                <div
                  key={type}
                  className={`p-2 rounded-lg border transition-all duration-300 ${PLATFORM_CONFIG[type].badgeColor}`}
                >
                  {PLATFORM_CONFIG[type].icon}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              No social links added yet
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mb-4">
              Help your students connect and collaborate by adding community
              links like Discord servers, GitHub repos, or YouTube playlists
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddLink}
              className="gap-2 hover:bg-primary/10 hover:text-primary transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Your First Link
            </Button>
          </div>
        ) : (
          /* Links List */
          <div className="space-y-3">
            {fields.map((field, index) => {
              const currentType =
                form.watch(`socialLinks.${index}.type`) ??
                SocialLinkType.DISCORD;
              const isPublic = form.watch(`socialLinks.${index}.isPublic`);
              const config = PLATFORM_CONFIG[currentType];

              return (
                <div
                  key={field.id}
                  className="group relative grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] gap-3 items-end p-4 border border-border/50 rounded-xl bg-card hover:border-primary/20 hover:shadow-sm transition-all duration-200"
                >
                  {/* Platform Selector */}
                  <FormField
                    control={form.control}
                    name={`socialLinks.${index}.type`}
                    render={({ field: typeField }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium text-muted-foreground">
                          Platform
                        </FormLabel>
                        <Select
                          value={typeField.value}
                          onValueChange={typeField.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  <span className={config.color}>
                                    {config.icon}
                                  </span>
                                  <span className="text-sm">
                                    {config.label}
                                  </span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(PLATFORM_CONFIG).map(
                              ([type, cfg]) => (
                                <SelectItem key={type} value={type}>
                                  <div className="flex items-center gap-2">
                                    <span className={cfg.color}>
                                      {cfg.icon}
                                    </span>
                                    <span>{cfg.label}</span>
                                  </div>
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* URL Input */}
                  <FormField
                    control={form.control}
                    name={`socialLinks.${index}.url`}
                    render={({ field: urlField }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium text-muted-foreground">
                          URL
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div
                              className={`absolute left-3 top-1/2 -translate-y-1/2 ${config.color}`}
                            >
                              {config.icon}
                            </div>
                            <Input
                              {...urlField}
                              type="url"
                              placeholder={config.placeholder}
                              className="h-10 pl-10 pr-4 text-sm"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Actions: Public Toggle + Delete */}
                  <div className="flex items-center gap-2 pb-[2px]">
                    <TooltipProvider delayDuration={200}>
                      {/* Public Toggle */}
                      <FormField
                        control={form.control}
                        name={`socialLinks.${index}.isPublic`}
                        render={({ field: publicField }) => (
                          <FormItem className="space-y-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FormControl>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className={`h-10 w-10 ${
                                      publicField.value
                                        ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                                    onClick={() =>
                                      publicField.onChange(!publicField.value)
                                    }
                                  >
                                    {publicField.value ? (
                                      <Eye className="w-4 h-4" />
                                    ) : (
                                      <EyeOff className="w-4 h-4" />
                                    )}
                                  </Button>
                                </FormControl>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-xs">
                                  {publicField.value
                                    ? "Visible to students"
                                    : "Hidden from students"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </FormItem>
                        )}
                      />

                      {/* Delete */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p className="text-xs">Remove link</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })}

            {/* Add More Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddLink}
              className="w-full gap-2 border border-dashed border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 rounded-xl h-10 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Another Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
