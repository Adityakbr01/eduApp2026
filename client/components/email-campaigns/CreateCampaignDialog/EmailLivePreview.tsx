"use client";


import { TrafficLightDots } from "@/components/TrafficLightDots";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EMailfromName,
  EMailfromNamefromEmail,
} from "@/constants/EMAIL_CAMPAGN_CONST";
import { cn } from "@/lib/utils";
import { Eye, Mail, Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";

interface EmailLivePreviewProps {
  subject: string;
  content: string;
  previewText?: string;
  fromName?: string;
  fromEmail?: string;
  className?: string;
}

type DeviceView = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<DeviceView, string> = {
  desktop: "w-full max-w-[800px]",
  tablet: "w-[600px]",
  mobile: "w-[375px]",
};

const DEVICE_ICONS: Record<DeviceView, React.ReactNode> = {
  desktop: <Monitor className="h-4 w-4" />,
  tablet: <Tablet className="h-4 w-4" />,
  mobile: <Smartphone className="h-4 w-4" />,
};

export function EmailLivePreview({
  subject,
  content,
  previewText,
  fromName = EMailfromName,
  fromEmail = EMailfromNamefromEmail,
  className,
}: EmailLivePreviewProps) {
  const [deviceView, setDeviceView] = useState<DeviceView>("desktop");
  const [showRaw, setShowRaw] = useState(false);

  const sanitizedContent = content;

  return (
    <div className={cn("space-y-4 p-3 text-black", className)}>
      {/* Preview Controls */}
      <div className="flex items-center p-2 justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-white">Live Preview</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Device Toggle */}
          <div className="flex text-(--custom-accentColor) items-center border rounded-lg p-1 bg-muted/50">
            {(["desktop", "tablet", "mobile"] as DeviceView[]).map((device) => (
              <Button
                key={device}
                variant={deviceView === device ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3"
                onClick={() => setDeviceView(device)}
              >
                {DEVICE_ICONS[device]}
              </Button>
            ))}
          </div>
          {/* Raw/Preview Toggle */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "text-(--custom-accentColor)",
              showRaw ? "bg-(--custom-accentColor)" : "",
            )}
            onClick={() => setShowRaw(!showRaw)}
          >
            {showRaw ? "Preview" : "HTML"}
          </Button>
        </div>
      </div>

      {/* Email Preview Container */}
      <div className="flex justify-center text-black rounded-lg p-4 min-h-[500px] overflow-auto">
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            DEVICE_WIDTHS[deviceView],
          )}
        >
          {showRaw ? (
            // Raw HTML View
            <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400 overflow-auto max-h-[600px]">
              <pre className="whitespace-pre-wrap break-words">
                {content || "<!-- No content yet -->"}
              </pre>
            </div>
          ) : (
            // Email Client Mockup
            <div className="rounded-lg shadow-lg overflow-hidden">
              {/* Email Client Header */}
              <div className="border-b px-4 py-3">
               <TrafficLightDots height={30} width={35} />
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Inbox</span>
                  <Badge variant="secondary" className="ml-auto">
                    Preview
                  </Badge>
                </div>
              </div>

              {/* Email Header */}
              <div className="border-b px-6 py-4 space-y-2">
                <h2 className="font-semibold text-lg leading-tight">
                  {subject || "No subject"}
                </h2>
                {previewText && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {previewText}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-medium text-xs">
                        {fromName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{fromName}</p>
                      <p className="text-xs">{fromEmail}</p>
                    </div>
                  </div>
                  <span className="ml-auto text-xs">
                    {new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Email Body */}
              <div className="px-6 py-6">
                {content ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none
                                            prose-headings:mb-3 prose-headings:mt-4
                                            prose-p:my-2 prose-p:leading-relaxed
                                            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                                            prose-img:rounded-lg prose-img:shadow-md
                                            prose-ul:my-2 prose-li:my-0.5"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Email content will appear here</p>
                    <p className="text-sm mt-1">
                      Start typing or use AI to generate content
                    </p>
                  </div>
                )}
              </div>

              {/* Email Footer */}
              <div className="border-t px-6 py-4">
                <p className="text-xs text-muted-foreground text-center">
                  This is a preview. Actual email may appear slightly different
                  depending on the email client.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Device Info */}
      <div className="flex items-center text-white justify-center gap-2 text-xs ">
        {DEVICE_ICONS[deviceView]}
        <span className="capitalize">{deviceView} view</span>
        <span className="">•</span>
        <span>
          {deviceView === "desktop" && "800px"}
          {deviceView === "tablet" && "600px"}
          {deviceView === "mobile" && "375px"}
        </span>
      </div>
    </div>
  );
}
