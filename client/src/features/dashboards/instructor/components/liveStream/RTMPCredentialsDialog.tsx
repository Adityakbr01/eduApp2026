"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { useGetStreamCredentials } from "@/services/liveStream";
import { useState } from "react";
import toast from "react-hot-toast";

interface RTMPCredentialsDialogProps {
  streamId: string | null;
  open: boolean;
  onClose: () => void;
}

export function RTMPCredentialsDialog({
  streamId,
  open,
  onClose,
}: RTMPCredentialsDialogProps) {
  const { data, isLoading } = useGetStreamCredentials(streamId || "", {
    enabled: !!streamId && open,
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const credentials = data?.data;

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎥 RTMP Streaming Credentials
          </DialogTitle>
          <DialogDescription>
            Use these credentials in OBS Studio or any RTMP streaming software.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="h-10 bg-muted animate-pulse rounded-md" />
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </div>
        ) : credentials ? (
          <div className="space-y-4 py-4">
            {/* Server URL */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Server URL
              </Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={credentials.serverUrl}
                  className="font-mono text-xs"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(credentials.serverUrl, "Server URL")
                  }
                >
                  {copiedField === "Server URL" ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Stream Key */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Stream Key
              </Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={credentials.streamKey}
                  type="password"
                  className="font-mono text-xs"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(credentials.streamKey, "Stream Key")
                  }
                >
                  {copiedField === "Stream Key" ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Player Embed Code */}
            {credentials.playerEmbedCode && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Player Embed Code
                </Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={credentials.playerEmbedCode}
                    className="font-mono text-xs"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(
                        credentials.playerEmbedCode!,
                        "Player Embed Code",
                      )
                    }
                  >
                    {copiedField === "Player Embed Code" ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* OBS Instructions */}
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">OBS Setup:</p>
              <p>1. Open OBS → Settings → Stream</p>
              <p>2. Service: Custom</p>
              <p>3. Paste the Server URL and Stream Key</p>
              <p>4. Click &quot;Start Streaming&quot;</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            Failed to load credentials. Please try again.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
