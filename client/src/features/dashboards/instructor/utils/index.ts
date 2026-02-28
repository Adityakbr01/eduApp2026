"use client";

import { BellIcon } from "@/components/ui/bell-icon";
import { BookOpenTextIcon } from "@/components/ui/book-open-text-icon";
import { LayoutGridIcon } from "@/components/ui/layout-grid-icon";
import { CourseStatus, ICourse } from "@/services/courses";
import { BookOpen, Radio, Video } from "lucide-react";

// ==================== SIDEBAR ITEMS ====================

export const instructorSidebarItems = [
    { label: "Overview", icon: LayoutGridIcon, value: "overview" },
    { label: "My Courses", icon: BookOpen, value: "courses" },
    { label: "Live Streams", icon: Radio, value: "live-streams" },
    { label: "Content Library", icon: Video, value: "content" },
    { label: "Grading", icon: BookOpenTextIcon, value: "grading" },
    { label: "Notifications", icon: BellIcon, value: "notifications" },
] as const;

export type InstructorSidebarValue = (typeof instructorSidebarItems)[number]["value"];

// ==================== STATS ====================

export interface InstructorStat {
    label: string;
    value: string | number;
    trend: string;
    bgColor: string;
    border: string;
}

export const getDefaultStats = (): InstructorStat[] => [
    {
        label: "Total Courses",
        value: "0",
        trend: "Start creating courses",
        bgColor: "bg-primary/10",
        border: "border-primary/10",
    },
    {
        label: "Published",
        value: "0",
        trend: "No published courses yet",
        bgColor: "bg-emerald-500/10",
        border: "border-emerald-500/10",
    },
    {
        label: "Draft",
        value: "0",
        trend: "No drafts",
        bgColor: "bg-amber-500/10",
        border: "border-amber-500/10",
    },
];

export const calculateStats = (courses: ICourse[]): InstructorStat[] => {
    const total = courses.length;
    const published = courses.filter((c) => c.status === CourseStatus.PUBLISHED).length;
    const draft = courses.filter((c) => c.status === CourseStatus.DRAFT).length;
    const pending = courses.filter((c) => c.status === CourseStatus.PENDING_REVIEW).length;

    return [
        {
            label: "Total Courses",
            value: total.toString(),
            trend: published > 0 ? `${published} live courses` : "Create your first course",
            bgColor: "bg-primary/10",
            border: "border-primary/10",
        },
        {
            label: "Published",
            value: published.toString(),
            trend: published > 0 ? "Visible to students" : "Publish to go live",
            bgColor: "bg-emerald-500/10",
            border: "border-emerald-500/10",
        },
        {
            label: "Drafts",
            value: draft.toString(),
            trend: pending > 0 ? `${pending} pending review` : "Work in progress",
            bgColor: "bg-amber-500/10",
            border: "border-amber-500/10",
        },
    ];
};

// ==================== COURSE INSIGHTS ====================

export interface CourseInsight {
    id: string;
    title: string;
    status: CourseStatus;
    level: string;
    updatedAt: string;
}

export const getRecentCourses = (courses: ICourse[], limit = 5): CourseInsight[] => {
    return courses
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, limit)
        .map((course) => ({
            id: course._id,
            title: course.title,
            status: course.status,
            level: course.level,
            updatedAt: formatTimeAgo(new Date(course.updatedAt)),
        }));
};

// ==================== HELPERS ====================

export const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
};

export const statusConfig: Record<
    CourseStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
    [CourseStatus.DRAFT]: {
        label: "Draft",
        variant: "secondary",
        className: "bg-slate-100 text-slate-800",
    },
    [CourseStatus.PENDING_REVIEW]: {
        label: "Pending",
        variant: "outline",
        className: "bg-amber-100 text-amber-800",
    },
    [CourseStatus.PUBLISHED]: {
        label: "Published",
        variant: "default",
        className: "bg-emerald-100 text-emerald-800",
    },
    [CourseStatus.ARCHIVED]: {
        label: "Archived",
        variant: "secondary",
        className: "bg-slate-100 text-slate-600",
    },
    [CourseStatus.REJECTED]: {
        label: "Rejected",
        variant: "destructive",
        className: "bg-red-100 text-red-800",
    },
    [CourseStatus.UNPUBLISHED]: {
        label: "Unpublished",
        variant: "destructive",
        className: "bg-red-100 text-red-800",
    },
    [CourseStatus.APPROVED]: {
        label: "Approved",
        variant: "default",
        className: "bg-emerald-100 text-emerald-800",
    },
};
