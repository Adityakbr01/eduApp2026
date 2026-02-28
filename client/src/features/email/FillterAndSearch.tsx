"use client";

import CampaignCard from "@/features/email/CampaignCard";
import { Card, CardContent } from "@/components/ui/card";
import { CampaignStatus } from "@/services/campaigns";

import { CampaignHeader } from "./CampaignHeader";
import { CampaignStatusTabs } from "./CampaignStatusTabs";
import { CampaignListState } from "./CampaignListState";

interface Props {
  pagination: any;
  filteredCampaigns: any[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: CampaignStatus | "all";
  setStatusFilter: (s: CampaignStatus | "all") => void;
  isSending: boolean;
  isCancelling: boolean;
  handleSend: (id: string) => void;
  handleCancel: (id: string) => void;
  setCreateDialogOpen: (v: boolean) => void;
  setPreviewCampaignId: (id: string | null) => void;
  setScheduleCampaignId: (id: string | null) => void;
  setDeleteConfirmId: (id: string | null) => void;
}

function FillterAndSearchAndList(props: Props) {
  const {
    pagination,
    filteredCampaigns,
    isLoading,
    isError,
    refetch,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isSending,
    isCancelling,
    handleSend,
    handleCancel,
    setCreateDialogOpen,
    setPreviewCampaignId,
    setScheduleCampaignId,
    setDeleteConfirmId,
  } = props;

  return (
    <Card>
      <CampaignHeader
        total={pagination?.total}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <CampaignStatusTabs value={statusFilter} onChange={setStatusFilter} />

      <CardContent className="pt-0">
        <CampaignListState
          isLoading={isLoading}
          isError={isError}
          isEmpty={!filteredCampaigns.length}
          searchQuery={searchQuery}
          onRetry={refetch}
          onCreate={() => setCreateDialogOpen(true)}
        />

        {!isLoading && !isError && filteredCampaigns.length > 0 && (
          <div className="space-y-3">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign._id}
                campaign={campaign}
                onPreview={() => setPreviewCampaignId(campaign._id)}
                onSend={() => handleSend(campaign._id)}
                onScheduleClick={() => setScheduleCampaignId(campaign._id)}
                onCancel={() => handleCancel(campaign._id)}
                onDelete={() => setDeleteConfirmId(campaign._id)}
                isSending={isSending}
                isCancelling={isCancelling}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FillterAndSearchAndList;
