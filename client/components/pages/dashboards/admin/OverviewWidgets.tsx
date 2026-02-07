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

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        {/* ================= RECENT USERS ================= */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              {titlePrefix}Recent users
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Latest activity across your workspace.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 sm:space-y-4">
            {recentUsers.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-2 sm:gap-3"
              >
                {/* Left */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm shrink-0">
                    <AvatarFallback>
                      {entry.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    {/* Name */}
                    <p className="font-medium text-sm sm:text-base truncate">
                      {entry.name}
                    </p>

                    {/* Email */}
                    <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                      {entry.email}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="text-right shrink-0 space-y-1">
                  <Badge
                    className={cn(
                      "text-[10px] sm:text-xs",
                      entry.status.className,
                    )}
                  >
                    {entry.status.label}
                  </Badge>

                  {/* Hide on small devices */}
                  <p className="hidden sm:block text-xs text-muted-foreground">
                    {entry.timeAgo}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ================= USER ACTIVITY ================= */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              User activity
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Approvals, bans, invites at a glance.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 sm:space-y-4">
            {activityFeed.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border bg-muted/40 p-3 space-y-1"
              >
                {/* Title + Time */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium line-clamp-1 sm:line-clamp-none">
                    {item.title}
                  </span>

                  {/* Hide timestamp on mobile */}
                  <span className="hidden sm:block text-xs text-muted-foreground shrink-0">
                    {item.timestamp}
                  </span>
                </div>

                {/* Description */}
                <p
                  className={cn(
                    "text-xs line-clamp-2 sm:line-clamp-none",
                    item.tone === "success" && "text-emerald-600",
                    item.tone === "warning" && "text-amber-600",
                    item.tone === "danger" && "text-red-600",
                    item.tone === "info" && "text-primary",
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
