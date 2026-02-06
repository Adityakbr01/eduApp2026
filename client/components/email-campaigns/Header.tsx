
"use client";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip";
import {
    Mail,
    RefreshCw,
    Sparkles
} from "lucide-react";


function Header({    setCreateDialogOpen,
    isRefetching,
    refetch,}: {
    setCreateDialogOpen: (open: boolean) => void;
    isRefetching: boolean;
    refetch: () => void;
}) {
  return (
    
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Mail className="h-6 w-6 text-primary" />
                            Email Marketing
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Create and manage email campaigns with AI assistance
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => refetch()}
                                    disabled={isRefetching}
                                >
                                    <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Refresh campaigns</TooltipContent>
                        </Tooltip>
                        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                            <Sparkles className="h-4 w-4" />
                            New Campaign
                        </Button>
                    </div>
                </div>
  )
}

export default Header