"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Menu } from "lucide-react";
import Link from "next/link";
import { InstructorSidebarValue } from "./utils";

interface InstructorHeaderProps {
    sectionTitle: string;
    activeSection: InstructorSidebarValue;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onMenuClick?: () => void;
}

export function InstructorHeader({
    sectionTitle,
    activeSection,
    searchQuery,
    setSearchQuery,
    onMenuClick,
}: InstructorHeaderProps) {
    return (
        <header className="border-b bg-linear-to-r from-primary/5 via-background/80 to-background/80 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="lg:hidden"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div>
                        <p className="text-sm text-primary font-semibold">
                            🎓 Instructor Dashboard
                        </p>
                        <h2 className="text-2xl font-bold tracking-tight text-primary">
                            {sectionTitle}
                        </h2>
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    {activeSection === "courses" && (
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 pl-10 pr-3 text-sm"
                            />
                        </div>
                    )}
                    <Button asChild className="gap-2">
                        <Link href="/dashboard/Instructor/courses/create">
                            <Plus className="h-4 w-4" />
                            Create Course
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
