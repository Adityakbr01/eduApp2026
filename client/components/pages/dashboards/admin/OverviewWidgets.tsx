"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ActivityFeedItem, RecentUserItem } from "../common/utils";

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
  titlePrefix?: string;
}

const OverviewWidgets = ({
  stats,
  recentUsers,
  activityFeed,
  titlePrefix = "",
}: OverviewWidgetsProps) => {
  return (
    <div className="space-y-6 overflow-y-scroll">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className={cn(stat.border, stat.bgColor)}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl font-bold">{stat.value}</CardTitle>
            </CardHeader>
            <CardFooter>
              <span className="text-sm text-muted-foreground">
                {stat.trend}
              </span>
            </CardFooter>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{titlePrefix}Recent users</CardTitle>
            <CardDescription>
              Latest activity across your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentUsers.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3"
              >
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
                    <p className="text-xs text-muted-foreground">
                      {entry.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={cn("text-xs", entry.status.className)}>
                    {entry.status.label}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {entry.timeAgo}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User activity</CardTitle>
            <CardDescription>
              Approvals, bans, invites at a glance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityFeed.map((item) => (
              <div key={item.id} className="rounded-lg border bg-muted/40 p-3">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{item.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.timestamp}
                  </span>
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
    </div>
  );
};

export default OverviewWidgets;
