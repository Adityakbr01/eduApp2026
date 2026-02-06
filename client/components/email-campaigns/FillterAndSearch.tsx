
"use client";

import CampaignCard from "@/components/email-campaigns/CampaignCard";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    CampaignStatus
} from "@/services/campaigns";
import {
    MailOpen,
    Plus,
    RefreshCw,
    Search,
    XCircle
} from "lucide-react";


interface FillterAndSearchAndList {
    pagination: any;
    filteredCampaigns: any[];
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: CampaignStatus | "all";
    setStatusFilter: (status: CampaignStatus | "all") => void;
    isSending: boolean;
    isCancelling: boolean;
    handleSend: (id: string) => void;
    handleCancel: (id: string) => void;
    setCreateDialogOpen: (open: boolean) => void;
    setPreviewCampaignId: (id: string | null) => void;
    setDeleteConfirmId: (id: string | null) => void;
}


function FillterAndSearchAndList({pagination,filteredCampaigns,isLoading,isError,refetch,searchQuery,setSearchQuery,statusFilter,setStatusFilter,isSending,isCancelling,handleSend,handleCancel,setCreateDialogOpen,setPreviewCampaignId,setDeleteConfirmId}: FillterAndSearchAndList) {
  return (
    <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg">All Campaigns</CardTitle>
                                <CardDescription>
                                    {pagination ? `${pagination.total} total campaigns` : "Manage your email campaigns"}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search campaigns..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 w-[200px] sm:w-[250px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Status Tabs */}
                    <div className="px-6 pb-4">
                        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as CampaignStatus | "all")}>
                            <TabsList className="h-9">
                                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                                <TabsTrigger value={CampaignStatus.DRAFT} className="text-xs">Draft</TabsTrigger>
                                <TabsTrigger value={CampaignStatus.SCHEDULED} className="text-xs">Scheduled</TabsTrigger>
                                <TabsTrigger value={CampaignStatus.PROCESSING} className="text-xs">Sending</TabsTrigger>
                                <TabsTrigger value={CampaignStatus.COMPLETED} className="text-xs">Completed</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <CardContent className="pt-0">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border">
                                        <Skeleton className="h-12 w-12 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-1/3" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="text-center py-16">
                                <XCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
                                <h3 className="text-lg font-medium mb-2">Failed to load campaigns</h3>
                                <p className="text-muted-foreground mb-4">
                                    Something went wrong. Please try again.
                                </p>
                                <Button onClick={() => refetch()} variant="outline" className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Retry
                                </Button>
                            </div>
                        ) : filteredCampaigns.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                                    <div className="relative h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                                        <MailOpen className="h-10 w-10 text-primary" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {searchQuery ? "No campaigns found" : "No campaigns yet"}
                                </h3>
                                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                    {searchQuery
                                        ? "Try adjusting your search or filters"
                                        : "Create your first email campaign and reach your audience with AI-powered content"}
                                </p>
                                {!searchQuery && (
                                    <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create Your First Campaign
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredCampaigns.map((campaign) => (
                                    <CampaignCard
                                        key={campaign._id}
                                        campaign={campaign}
                                        onPreview={() => setPreviewCampaignId(campaign._id)}
                                        onSend={() => handleSend(campaign._id)}
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
  )
}

export default FillterAndSearchAndList