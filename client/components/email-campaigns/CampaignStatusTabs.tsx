"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignStatus } from "@/services/campaigns";

interface CampaignStatusTabsProps {
  value: CampaignStatus | "all";
  onChange: (v: CampaignStatus | "all") => void;
}

export function CampaignStatusTabs({
  value,
  onChange,
}: CampaignStatusTabsProps) {
  return (
    <div className="px-4 sm:px-6 pb-3 overflow-x-auto">
      <Tabs value={value} onValueChange={(v) => onChange(v as any)}>
        <TabsList className="h-9 w-max min-w-full sm:w-auto">
          <TabsTrigger value="all" className="text-xs">
            All
          </TabsTrigger>
          <TabsTrigger value={CampaignStatus.DRAFT} className="text-xs">
            Draft
          </TabsTrigger>
          <TabsTrigger value={CampaignStatus.SCHEDULED} className="text-xs">
            Scheduled
          </TabsTrigger>
          <TabsTrigger value={CampaignStatus.PROCESSING} className="text-xs">
            Sending
          </TabsTrigger>
          <TabsTrigger value={CampaignStatus.COMPLETED} className="text-xs">
            Completed
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
