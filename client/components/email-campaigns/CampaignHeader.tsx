"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CampaignHeaderProps {
  total?: number;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}

export function CampaignHeader({
  total,
  searchQuery,
  setSearchQuery,
}: CampaignHeaderProps) {
  return (
    <CardHeader className="pb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base sm:text-lg">All Campaigns</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {total ? `${total} total campaigns` : "Manage your email campaigns"}
          </CardDescription>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full sm:w-[240px]"
          />
        </div>
      </div>
    </CardHeader>
  );
}
