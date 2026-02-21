"use client";

import { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

import type {
  CourseCurriculumProps,
  ParsedSection,
  ParsedModule,
} from "../types";
import { parseMarkdownCurriculum } from "../utils";

// ==================== SVG ICON ====================

function AIIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 text-purple-400 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

// ==================== ACCORDION COMPONENTS ====================

function SectionAccordion({
  section,
  defaultExpanded = false,
}: {
  section: ParsedSection;
  defaultExpanded?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-orange-400 shrink-0" />
          <h3 className="text-base font-semibold text-white text-left">
            {section.title}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40 font-medium">
            {section.modules.length}{" "}
            {section.modules.length === 1 ? "module" : "modules"}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-white/40 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </button>
      {isOpen && (
        <div className="px-5 pb-4 space-y-3">
          {section.modules.map((mod, idx) => (
            <ModuleAccordion
              key={idx}
              module={mod}
              defaultExpanded={idx === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleAccordion({
  module,
  defaultExpanded = false,
}: {
  module: ParsedModule;
  defaultExpanded?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  return (
    <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-white/[0.02]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <AIIcon />
          <span className="text-sm font-medium text-white/80 text-left">
            {module.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30">
            {module.topics.length}{" "}
            {module.topics.length === 1 ? "topic" : "topics"}
          </span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-white/30 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </button>
      {isOpen && module.topics.length > 0 && (
        <div className="px-4 pb-3">
          <ul className="space-y-1.5">
            {module.topics.map((topic, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm text-white/50 pl-6"
              >
                <span className="w-1 h-1 rounded-full bg-white/20 mt-2 shrink-0" />
                {topic}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function CourseCurriculum({
  curriculum,
}: CourseCurriculumProps) {
  const sections = parseMarkdownCurriculum(curriculum);

  if (sections.length === 0) {
    return (
      <div className="text-center py-12 text-white/40">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No curriculum content available</p>
      </div>
    );
  }

  const totalModules = sections.reduce((acc, s) => acc + s.modules.length, 0);
  const totalTopics = sections.reduce(
    (acc, s) => acc + s.modules.reduce((a, m) => a + m.topics.length, 0),
    0,
  );

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-white/40 mb-2">
        <span>
          {sections.length} {sections.length === 1 ? "section" : "sections"}
        </span>
        <span>•</span>
        <span>
          {totalModules} {totalModules === 1 ? "module" : "modules"}
        </span>
        <span>•</span>
        <span>
          {totalTopics} {totalTopics === 1 ? "topic" : "topics"}
        </span>
      </div>

      {/* Sections */}
      {sections.map((section, idx) => (
        <SectionAccordion
          key={idx}
          section={section}
          defaultExpanded={idx === 0}
        />
      ))}
    </div>
  );
}
