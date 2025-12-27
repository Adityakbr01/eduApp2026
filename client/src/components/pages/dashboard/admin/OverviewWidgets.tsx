"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ActivityFeedItem, BanSummary, CourseInsight, RecentUserItem } from "./utils";

export type StatSummary = {
    label: string;
    value: string | number;
    trend: string;
    bgColor?: string;
    border?: string;
};

interface OverviewWidgetsProps {
    stats: StatSummary[];
    recentUsers: RecentUserItem[];
    activityFeed: ActivityFeedItem[];
    courseInsights: CourseInsight[];
    banSummary: BanSummary;
    titlePrefix?: string;
}

const OverviewWidgets = ({
    stats,
    recentUsers,
    activityFeed,
    courseInsights,
    banSummary,
    titlePrefix = "",
}: OverviewWidgetsProps) => {
    return (
        <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.label} className={cn(stat.border, stat.bgColor)}>
                        <CardHeader>
                            <CardDescription>{stat.label}</CardDescription>
                            <CardTitle className="text-3xl font-bold">{stat.value}</CardTitle>
                        </CardHeader>
                        <CardFooter>
                            <span className="text-sm text-muted-foreground">{stat.trend}</span>
                        </CardFooter>
                    </Card>
                ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>{titlePrefix}Recent users</CardTitle>
                        <CardDescription>Latest activity across your workspace.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentUsers.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 text-sm">
                                        <AvatarFallback>
                                            {entry.name
                                                .split(" ")
                                                .map((part) => part[0])
                                                .slice(0, 2)
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium leading-tight">{entry.name}</p>
                                        <p className="text-xs text-muted-foreground">{entry.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge className={cn("text-xs", entry.status.className)}>{entry.status.label}</Badge>
                                    <p className="text-xs text-muted-foreground">{entry.timeAgo}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>User activity</CardTitle>
                        <CardDescription>Approvals, bans, invites at a glance.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activityFeed.map((item) => (
                            <div key={item.id} className="rounded-lg border bg-muted/40 p-3">
                                <div className="flex items-center justify-between text-sm font-medium">
                                    <span>{item.title}</span>
                                    <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                                </div>
                                <p
                                    className={cn(
                                        "text-xs",
                                        item.tone === "success" && "text-emerald-600",
                                        item.tone === "warning" && "text-amber-600",
                                        item.tone === "danger" && "text-red-600",
                                        item.tone === "info" && "text-primary"
                                    )}
                                >
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Course insights</CardTitle>
                        <CardDescription>Mock course telemetry for stakeholder previews.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        {courseInsights.map((insight) => (
                            <div key={insight.id} className="rounded-xl border p-4">
                                <p className="text-sm text-muted-foreground">{insight.title}</p>
                                <p className={cn("text-3xl font-semibold", insight.accent)}>{insight.value}</p>
                                <p className="text-xs text-muted-foreground">{insight.subtext}</p>
                                {insight.trend && <p className="text-xs text-primary">{insight.trend}</p>}
                                <Progress value={insight.progress} className="mt-3" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ban & restore</CardTitle>
                        <CardDescription>{banSummary.deltaLabel}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6">
                            <div>
                                <p className="text-xs uppercase text-muted-foreground">Banned</p>
                                <p className="text-3xl font-semibold text-red-600">{banSummary.totalBanned}</p>
                            </div>
                            <Separator orientation="vertical" className="h-10" />
                            <div>
                                <p className="text-xs uppercase text-muted-foreground">Restored</p>
                                <p className="text-3xl font-semibold text-emerald-600">{banSummary.totalRestored}</p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-3">
                            {banSummary.events.map((event) => (
                                <div key={event.id} className="rounded-lg border p-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span>{event.name}</span>
                                        <span className="text-xs text-muted-foreground">{event.timeAgo}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{event.note}</p>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "mt-2 border-dashed text-xs",
                                            event.action === "ban"
                                                ? "border-red-300 text-red-600"
                                                : "border-emerald-300 text-emerald-600"
                                        )}
                                    >
                                        {event.action === "ban" ? "Banned" : "Restored"}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
};

export default OverviewWidgets;
