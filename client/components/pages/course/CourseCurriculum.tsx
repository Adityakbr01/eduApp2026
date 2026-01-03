"use client";

import { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ==================== TYPES ====================

interface CourseCurriculumProps {
    curriculum: string;
}

interface ParsedSection {
    title: string;
    modules: ParsedModule[];
}

interface ParsedModule {
    title: string;
    topics: string[];
}

// ==================== SVG ICON ====================

function AIIcon() {
    return (
        <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            fill="currentColor"
        >
            <path d="M256 0a21.33 21.33 0 0 0-21.33 21.33v21.34a21.33 21.33 0 0 0 42.66 0V21.33A21.33 21.33 0 0 0 256 0zM170.67 42.67a21.33 21.33 0 0 0-21.34 21.33v42.67H106.7a42.67 42.67 0 0 0-42.7 42.66v42.67H42.67a21.33 21.33 0 1 0 0 42.67H64v85.32H42.67a21.33 21.33 0 1 0 0 42.67H64v42.67a42.67 42.67 0 0 0 42.7 42.66h42.63v42.67a21.33 21.33 0 1 0 42.67 0V448h85.33v42.67a21.33 21.33 0 1 0 42.67 0V448h42.63a42.67 42.67 0 0 0 42.7-42.66v-42.67H469.3a21.33 21.33 0 1 0 0-42.67H448v-85.32h21.33a21.33 21.33 0 1 0 0-42.67H448v-42.67a42.67 42.67 0 0 0-42.7-42.66h-42.63V64a21.33 21.33 0 0 0-42.67 0v42.67h-85.33V64a21.33 21.33 0 0 0-21.34-21.33zM149.33 128h213.34A21.33 21.33 0 0 1 384 149.33v213.34a21.33 21.33 0 0 1-21.33 21.33H149.33A21.33 21.33 0 0 1 128 362.67V149.33A21.33 21.33 0 0 1 149.33 128zm50.67 64a10.67 10.67 0 0 0-10.28 8.05l-32 128a10.67 10.67 0 1 0 20.66 5.23L187.6 298h36.8l8.22 33.28a10.67 10.67 0 1 0 20.66-5.23l-32-128a10.67 10.67 0 0 0-10.28-8.05zm7.57 33.92L219.4 277h-25.47zM277.33 192a10.67 10.67 0 1 0 0 21.33h21.34v85.34h-21.34a10.67 10.67 0 1 0 0 21.33h53.34a10.67 10.67 0 1 0 0-21.33H309.3v-85.34h21.37a10.67 10.67 0 1 0 0-21.33z" />
        </svg>
    );
}

// ==================== MARKDOWN PARSER ====================

function parseMarkdownCurriculum(markdown: string): ParsedSection[] {
    if (!markdown || markdown.trim() === "") return [];

    const lines = markdown.split("\n");
    const sections: ParsedSection[] = [];
    let currentSection: ParsedSection | null = null;
    let currentModule: ParsedModule | null = null;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // # Main Section Title
        if (trimmedLine.startsWith("# ")) {
            if (currentModule && currentSection) {
                currentSection.modules.push(currentModule);
            }
            if (currentSection) {
                sections.push(currentSection);
            }
            currentSection = {
                title: trimmedLine.slice(2).trim(),
                modules: [],
            };
            currentModule = null;
        }
        // ## Module Title
        else if (trimmedLine.startsWith("## ")) {
            if (currentModule && currentSection) {
                currentSection.modules.push(currentModule);
            }
            currentModule = {
                title: trimmedLine.slice(3).trim(),
                topics: [],
            };
        }
        // ### Topics header (skip)
        else if (trimmedLine.startsWith("### ")) {
            // Just a header, skip
        }
        // - Topic item
        else if (trimmedLine.startsWith("- ")) {
            const topic = trimmedLine.slice(2).trim();
            if (currentModule) {
                currentModule.topics.push(topic);
            }
        }
        // Indented sub-topic
        else if (line.startsWith("  - ")) {
            const topic = "• " + line.slice(4).trim();
            if (currentModule) {
                currentModule.topics.push(topic);
            }
        }
    }

    // Push remaining items
    if (currentModule && currentSection) {
        currentSection.modules.push(currentModule);
    }
    if (currentSection) {
        sections.push(currentSection);
    }

    return sections;
}

// ==================== ACCORDION COMPONENTS ====================

interface SectionAccordionProps {
    section: ParsedSection;
    defaultExpanded?: boolean;
}

function SectionAccordion({ section, defaultExpanded = false }: SectionAccordionProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="border-none bg-transparent rounded-xl overflow-hidden shadow-none">
            {/* Section Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "w-full flex border-none outline-none items-center justify-between p-4 text-left transition-all duration-200",

                    isExpanded && "border-none"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
                        <AIIcon />
                    </div>
                    <h2 className="font-semibold text-lg text-foreground">{section.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground hidden sm:block">
                        {isExpanded ? "Collapse" : "Expand"}
                    </span>
                    <div className={cn(
                        "transition-transform duration-200",
                        isExpanded && "rotate-180"
                    )}>
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                </div>
            </button>

            {/* Section Content (Modules) */}
            <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}>
                <div className="overflow-hidden">
                    <div className="p-4 space-y-3 bg-transparent">
                        {section.modules.map((module, moduleIndex) => (
                            <ModuleAccordion key={moduleIndex} module={module} defaultExpanded={moduleIndex === 0} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ModuleAccordionProps {
    module: ParsedModule;
    defaultExpanded?: boolean;
}

function ModuleAccordion({ module, defaultExpanded = false }: ModuleAccordionProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="border-none rounded-lg overflow-hidden bg-transparent shadow-none">
            {/* Module Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "w-full bg-transparent flex items-center justify-between p-3 text-left transition-all duration-200",
                    isExpanded && "border-none"
                )}
            >
                <h3 className="font-medium text-foreground">{module.title}</h3>
                <div className={cn(
                    "transition-transform duration-200",
                    isExpanded && "rotate-180"
                )}>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
            </button>

            {/* Module Topics */}
            <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}>
                <div className="overflow-hidden">
                    <div className="p-3 space-y-2 bg-transparent">
                        {module.topics.map((topic, topicIndex) => (
                            <div
                                key={topicIndex}
                                className={cn(
                                    "flex items-start gap-2 py-2 px-3 rounded-md text-sm",
                                    "bg-transparent hover:bg-muted/20 transition-colors",
                                    topic.startsWith("•") && "ml-4 text-muted-foreground"
                                )}
                            >
                                {!topic.startsWith("•") && (
                                    <span className="text-primary mt-0.5">●</span>
                                )}
                                <span>{topic.startsWith("•") ? topic.slice(2) : topic}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==================== MAIN COMPONENT ====================

export default function CourseCurriculum({ curriculum }: CourseCurriculumProps) {
    const sections = parseMarkdownCurriculum(curriculum);

    if (!curriculum || curriculum.trim() === "" || sections.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed rounded-lg bg-transparent">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No curriculum available yet</p>
            </div>
        );
    }

    // Calculate totals
    const totalModules = sections.reduce((sum, s) => sum + s.modules.length, 0);
    const totalTopics = sections.reduce(
        (sum, s) => sum + s.modules.reduce((mSum, m) => mSum + m.topics.filter(t => !t.startsWith("•")).length, 0),
        0
    );

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground pb-2">
                <span className="font-medium text-foreground">
                    {sections.length} Section{sections.length !== 1 ? "s" : ""}
                </span>
                <span>•</span>
                <span>{totalModules} Module{totalModules !== 1 ? "s" : ""}</span>
                <span>•</span>
                <span>{totalTopics} Topic{totalTopics !== 1 ? "s" : ""}</span>
            </div>

            {/* Accordion Sections */}
            <div className="space-y-4">
                {sections.map((section, sectionIndex) => (
                    <SectionAccordion
                        key={sectionIndex}
                        section={section}
                        defaultExpanded={sectionIndex === 0}
                    />
                ))}
            </div>
        </div>
    );
}
