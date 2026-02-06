

"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { iStats } from "@/services/campaigns";
import {
    AlertTriangle,
    CheckCircle2,
    Mail,
    Users
} from "lucide-react";



    {/* Stats Cards */}  
function StatsCards ({ stats}:{ stats: iStats }) {
  return (
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden">
                        <div className="absolute animate-pulse blur-2xl top-0 right-0 w-20 h-20 bg-primary/40 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Campaigns
                            </CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Mail className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.draft} drafts, {stats.completed} completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute animate-pulse blur-2xl  top-0 right-0 w-20 h-20 bg-emerald-500/40 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Emails Delivered
                            </CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-600">{stats.totalSent.toLocaleString()}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <Progress value={Number(stats.deliveryRate)} className="h-1.5 flex-1" />
                                <span className="text-xs text-muted-foreground">{stats.deliveryRate}%</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute animate-pulse blur-2xl top-0 right-0 w-20 h-20 bg-blue-500/45 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Recipients
                            </CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Users className="h-4 w-4 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalRecipients.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Across all campaigns
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute animate-pulse blur-2xl top-0 right-0 w-20 h-20 bg-red-500/40 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Failed Deliveries
                            </CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">{stats.totalFailed.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.processing > 0 && `${stats.processing} processing`}
                                {stats.processing === 0 && "No active campaigns"}
                            </p>
                        </CardContent>
                    </Card>
                </div>
  )
}

export default StatsCards 