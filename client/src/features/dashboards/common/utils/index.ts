"use client";

import { Activity, Bell, Settings, Shield, Users } from "lucide-react";

import { approvalStatusEnum, type User } from "@/services/auth";
import { StatusMeta, UserRow } from "../types";

export type RecentUserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: StatusMeta;
  timeAgo: string;
};

export type ActivityFeedItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  tone: "success" | "warning" | "info" | "danger";
};

export type CourseInsight = {
  id: string;
  title: string;
  value: string;
  subtext: string;
  progress: number;
  accent?: string;
  trend?: string;
};

export type BanUnbanEvent = {
  id: string;
  name: string;
  action: "ban" | "restore";
  note: string;
  timeAgo: string;
};

export type BanSummary = {
  totalBanned: number;
  totalRestored: number;
  deltaLabel: string;
  events: BanUnbanEvent[];
};

export const getStatusMeta = (user: User): StatusMeta => {
  // 🔴 BANNED — Always highest priority
  if (user.isBanned) {
    return {
      label: "Banned",
      className: statusPalette.danger,
    };
  }

  // ❌ REJECTED
  if (user.approvalStatus === approvalStatusEnum.REJECTED) {
    return {
      label: "Rejected",
      className: statusPalette.danger,
    };
  }

  // ⏳ PENDING
  if (user.approvalStatus === approvalStatusEnum.PENDING) {
    return {
      label: "Pending approval",
      className: statusPalette.warning,
    };
  }

  // ✉️ EMAIL NOT VERIFIED
  if (!user.isEmailVerified) {
    return {
      label: "Email unverified",
      className: statusPalette.info,
    };
  }

  // 🟢 ACTIVE (Approved + Verified + Not banned)
  return {
    label: "Active",
    className: statusPalette.success,
  };
};

const sidebarItems = [
  { label: "Overview", icon: Activity, value: "overview" },
  { label: "Users", icon: Users, value: "users" },
  { label: "Courses", icon: Shield, value: "courses" },
  { label: "Live Access", icon: Activity, value: "live-access" },
  { label: "Email Marketing", icon: Settings, value: "email" },
  { label: "Push Notifications", icon: Bell, value: "push" },
];
const ManagerSidebarItems = [
  { label: "Overview", icon: Activity, value: "overview" },
  { label: "Users", icon: Users, value: "users" },
  { label: "Courses", icon: Shield, value: "courses" },
];

const quickStats = [
  {
    label: "Total Users",
    value: "1,294",
    trend: "+8% vs last week",
    bgColor: "bg-primary/10",
    border: "border-primary/10",
  },
  {
    label: "Active Sessions",
    value: "412",
    trend: "–3% vs last week",
    bgColor: "bg-blue-100/10",
    border: "border-blue-100/10",
  },
  {
    label: "Pending Invites",
    value: "27",
    trend: "+5 new today",
    bgColor: "bg-amber-100/10",
    border: "border-amber-100/10",
  },
];

const mockUsers: UserRow[] = [
  {
    id: "USR-9081",
    name: "Ananya Sharma",
    email: "ananya@eduapp.com",
    roleLabel: "Admin",
    status: { label: "Active", className: "bg-emerald-100 text-emerald-800" },
    lastActive: "2 hours ago",
    rolePermissions: ["user:read", "user:update"],
    customPermissions: ["user:invite"],
    permissions: ["user:read", "user:update", "user:invite"],
  },
  {
    id: "USR-1023",
    name: "Rishi Patel",
    email: "rishi@eduapp.com",
    roleLabel: "Instructor",
    status: {
      label: "Pending invite",
      className: "bg-amber-100 text-amber-800",
    },
    lastActive: "Pending invite",
    rolePermissions: ["course:read"],
    customPermissions: [],
    permissions: ["course:read"],
  },
  {
    id: "USR-7610",
    name: "Sana Fakih",
    email: "sana@eduapp.com",
    roleLabel: "Moderator",
    status: { label: "Active", className: "bg-emerald-100 text-emerald-800" },
    lastActive: "5 mins ago",
    rolePermissions: ["discussion:read"],
    customPermissions: ["discussion:delete"],
    permissions: ["discussion:read", "discussion:delete"],
  },
];

const permissionScopes = [
  { key: "read", label: "Read" },
  { key: "invite", label: "Invite" },
  { key: "update", label: "Update" },
  { key: "delete", label: "Delete" },
] as const;

export type PermissionKey = (typeof permissionScopes)[number]["key"];

export type RolePermission = {
  role: string;
  description: string;
  permissions: Record<PermissionKey, boolean>;
};

const initialRolePermissions: RolePermission[] = [
  {
    role: "Super Admin",
    description: "Full platform control",
    permissions: {
      read: true,
      invite: true,
      update: true,
      delete: true,
    },
  },
  {
    role: "Admin",
    description: "Manage users & courses",
    permissions: {
      read: true,
      invite: true,
      update: true,
      delete: false,
    },
  },
  {
    role: "Instructor",
    description: "Teach & assist learners",
    permissions: {
      read: true,
      invite: false,
      update: true,
      delete: false,
    },
  },
];

const statusPalette = {
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-800",
  info: "bg-blue-100 text-blue-800",
};

const formatRelativeTime = (input?: string): string => {
  if (!input) return "Just now";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Recently";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const formatLastActive = (timestamp?: string): string => {
  if (!timestamp) return "—";
  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return "—";
  }
};

const mapApiUserToRow = (user: User): UserRow => {
  const rolePermissions = user.rolePermissions ?? [];
  const hasCustomPayload = Array.isArray(user.customPermissions);
  const rawCustomPermissions = hasCustomPayload
    ? (user.customPermissions ?? [])
    : [];
  const rawLegacyPermissions = Array.isArray(user.permissions)
    ? user.permissions
    : [];

  const effectivePermissions = user.effectivePermissions?.length
    ? user.effectivePermissions
    : hasCustomPayload
      ? [...new Set([...rolePermissions, ...rawCustomPermissions])]
      : rawLegacyPermissions.length
        ? rawLegacyPermissions
        : [...new Set(rolePermissions)];

  return {
    id: user.id!,
    name: user.name || "Unnamed",
    email: user.email! || "no email",
    roleLabel: user.roleName || user.roleId?.name || "Unknown role",
    roleDescription: user.roleId?.description,
    status: getStatusMeta(user),
    lastActive: formatLastActive(user.updatedAt ?? user.createdAt),
    rolePermissions,
    customPermissions: rawCustomPermissions,
    permissions: effectivePermissions,
    effectivePermissions,
    sourceUser: user,
  };
};

const mockRecentUsers: RecentUserItem[] = [
  {
    id: "mock-1",
    name: "Ishita Desai",
    email: "ishita@eduapp.com",
    role: "Instructor",
    status: { label: "Active", className: statusPalette.success },
    timeAgo: "5m ago",
  },
  {
    id: "mock-2",
    name: "Rohan Verma",
    email: "rohan@eduapp.com",
    role: "Student",
    status: { label: "Pending", className: statusPalette.warning },
    timeAgo: "18m ago",
  },
  {
    id: "mock-3",
    name: "Sara Khan",
    email: "sara@eduapp.com",
    role: "Moderator",
    status: { label: "Active", className: statusPalette.success },
    timeAgo: "1h ago",
  },
];

const mockActivityFeed: ActivityFeedItem[] = [
  {
    id: "activity-1",
    title: "3 approvals processed",
    description: "Managers cleared pending instructor requests",
    timestamp: "12m ago",
    tone: "success",
  },
  {
    id: "activity-2",
    title: "2 bans escalated",
    description: "Compliance flagged suspicious logins",
    timestamp: "45m ago",
    tone: "danger",
  },
  {
    id: "activity-3",
    title: "5 invites pending",
    description: "Awaiting admin review",
    timestamp: "1h ago",
    tone: "warning",
  },
];

const buildRecentUsers = (rows: UserRow[], limit = 5): RecentUserItem[] => {
  if (!rows?.length) return mockRecentUsers;
  const sorted = [...rows].sort((a, b) => {
    const aDate = new Date(
      a.sourceUser?.createdAt ?? a.sourceUser?.updatedAt ?? Date.now(),
    ).getTime();
    const bDate = new Date(
      b.sourceUser?.createdAt ?? b.sourceUser?.updatedAt ?? Date.now(),
    ).getTime();
    return bDate - aDate;
  });
  return sorted.slice(0, limit).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.roleLabel,
    status: row.status,
    timeAgo: formatRelativeTime(
      row.sourceUser?.createdAt ?? row.sourceUser?.updatedAt,
    ),
  }));
};

const buildActivityFeed = (rows: UserRow[]): ActivityFeedItem[] => {
  if (!rows?.length) return mockActivityFeed;
  const timeline: ActivityFeedItem[] = [...rows]
    .sort((a, b) => {
      const aDate = new Date(
        a.sourceUser?.updatedAt ?? a.sourceUser?.createdAt ?? Date.now(),
      ).getTime();
      const bDate = new Date(
        b.sourceUser?.updatedAt ?? b.sourceUser?.createdAt ?? Date.now(),
      ).getTime();
      return bDate - aDate;
    })
    .slice(0, 3)
    .map(
      (row, index): ActivityFeedItem => ({
        id: `timeline-${row.id}-${index}`,
        title: row.status.label,
        description: `${row.name} • ${row.roleLabel}`,
        timestamp: formatRelativeTime(
          row.sourceUser?.updatedAt ?? row.sourceUser?.createdAt,
        ),
        tone: row.status.label.toLowerCase().includes("ban")
          ? "danger"
          : row.status.label.toLowerCase().includes("pending")
            ? "warning"
            : "info",
      }),
    );

  const activeCount = rows.filter(
    (row) => row.status.label === "Active",
  ).length;
  const pendingCount = rows.filter((row) =>
    row.status.label.toLowerCase().includes("pending"),
  ).length;
  const bannedCount = rows.filter((row) =>
    row.status.label.toLowerCase().includes("ban"),
  ).length;

  const aggregate: ActivityFeedItem[] = [];
  if (activeCount) {
    aggregate.push({
      id: "activity-active",
      title: "Active accounts",
      description:
        `${activeCount} verified` +
        (pendingCount ? ` • ${pendingCount} awaiting review` : ""),
      timestamp: "today",
      tone: "success",
    });
  }
  if (bannedCount) {
    aggregate.push({
      id: "activity-ban",
      title: "Bans triggered",
      description: `${bannedCount} accounts locked in the last sync`,
      timestamp: "recent",
      tone: "danger",
    });
  }

  const combined = [...timeline, ...aggregate];
  return combined.length ? combined.slice(0, 4) : mockActivityFeed;
};

export const adminUtils = {
  sidebarItems,
  ManagerSidebarItems,
  quickStats,
  mockUsers,
  permissionScopes,
  initialRolePermissions,
  statusPalette,
  formatRelativeTime,
  formatLastActive,
  mapApiUserToRow,
  buildRecentUsers,
  buildActivityFeed,
};
