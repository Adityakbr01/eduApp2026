"use client";

import { CampaignPreviewDialog } from "@/features/email/CampaignPreviewDialog";
import ConfirmDeleteCampaign from "@/features/email/ConfirmDeleteCampaign";
import { CreateCampaignDialog } from "@/features/email/CreateCampaignDialog/CreateCampaignDialogWithAI";
import FillterAndSearchAndList from "@/features/email/FillterAndSearch";
import Header from "@/features/email/Header";
import { ScheduleCampaignDialog } from "@/features/email/ScheduleCampaignDialog";
import StatsCards from "@/features/email/StatsCards ";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  CampaignStatus,
  iStats,
  useCancelCampaign,
  useDeleteCampaign,
  useGetCampaigns,
  useSendCampaign,
} from "@/services/campaigns";
import { useMemo, useState } from "react";

export default function AdminEmailMarketingPage() {
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [previewCampaignId, setPreviewCampaignId] = useState<string | null>(
    null,
  );
  const [scheduleCampaignId, setScheduleCampaignId] = useState<string | null>(
    null,
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useGetCampaigns(
    statusFilter !== "all" ? { status: statusFilter } : undefined,
  );

  const { mutate: sendCampaign, isPending: isSending } = useSendCampaign();
  const { mutate: cancelCampaign, isPending: isCancelling } =
    useCancelCampaign();
  const { mutate: deleteCampaign, isPending: isDeleting } = useDeleteCampaign();

  const campaigns = useMemo(
    () => data?.data?.campaigns || [],
    [data?.data?.campaigns],
  );
  const pagination = data?.data?.pagination;

  // Filter campaigns by search
  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const query = searchQuery.toLowerCase();
    return campaigns.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.subject.toLowerCase().includes(query),
    );
  }, [campaigns, searchQuery]);

  // Calculate stats
  const stats: iStats = useMemo(() => {
    const total = campaigns.length;
    const draft = campaigns.filter(
      (c) => c.status === CampaignStatus.DRAFT,
    ).length;
    const completed = campaigns.filter(
      (c) => c.status === CampaignStatus.COMPLETED,
    ).length;
    const processing = campaigns.filter(
      (c) => c.status === CampaignStatus.PROCESSING,
    ).length;
    const totalSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
    const totalFailed = campaigns.reduce((acc, c) => acc + c.failedCount, 0);
    const totalRecipients = campaigns.reduce(
      (acc, c) =>
        acc + (c.metadata.actualRecipients || c.metadata.estimatedRecipients),
      0,
    );
    const deliveryRate =
      totalRecipients > 0
        ? ((totalSent / totalRecipients) * 100).toFixed(1)
        : "0";

    return {
      total,
      draft,
      completed,
      processing,
      totalSent,
      totalFailed,
      totalRecipients,
      deliveryRate,
    };
  }, [campaigns]);

  const handleSend = (id: string) => {
    sendCampaign({ id });
  };

  const handleSchedule = (id: string, scheduledAt: string) => {
    sendCampaign(
      { id, data: { scheduledAt } },
      {
        onSuccess: () => setScheduleCampaignId(null),
      },
    );
  };

  const handleCancel = (id: string) => {
    cancelCampaign(id);
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteCampaign(deleteConfirmId, {
        onSuccess: () => setDeleteConfirmId(null),
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-10">
        <Header
          setCreateDialogOpen={setCreateDialogOpen}
          isRefetching={isRefetching}
          refetch={refetch}
        />

        <StatsCards stats={stats} />
        {/* Filters & Search */}

        <FillterAndSearchAndList
          pagination={pagination}
          filteredCampaigns={filteredCampaigns}
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          isSending={isSending}
          isCancelling={isCancelling}
          handleSend={handleSend}
          handleCancel={handleCancel}
          setCreateDialogOpen={setCreateDialogOpen}
          setPreviewCampaignId={setPreviewCampaignId}
          setDeleteConfirmId={setDeleteConfirmId}
          setScheduleCampaignId={setScheduleCampaignId}
        />

        {/* Dialogs */}
        <CreateCampaignDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        <CampaignPreviewDialog
          campaignId={previewCampaignId}
          open={!!previewCampaignId}
          onOpenChange={(open) => !open && setPreviewCampaignId(null)}
        />

        <ScheduleCampaignDialog
          isOpen={!!scheduleCampaignId}
          onClose={() => setScheduleCampaignId(null)}
          campaignId={scheduleCampaignId}
          onSchedule={handleSchedule}
          isScheduling={isSending}
        />

        <ConfirmDeleteCampaign
          deleteConfirmId={deleteConfirmId}
          setDeleteConfirmId={setDeleteConfirmId}
          handleDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </div>
    </TooltipProvider>
  );
}
