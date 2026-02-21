import { Star } from "lucide-react";
import { IReview, IReviewUser } from "@/services/reviews";
import type { ParsedSection, ParsedModule } from "../types";

// ==================== Star Rating ====================

export function renderStars(value: number, size: "sm" | "md" | "lg" = "md") {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= value
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

// ==================== Date Formatting ====================

export function formatReviewDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ==================== Review User Extraction ====================

export function getReviewUser(review: IReview): IReviewUser | null {
  if (typeof review.user === "object" && review.user !== null) {
    return review.user as IReviewUser;
  }
  return null;
}

// ==================== Markdown Curriculum Parser ====================

export function parseMarkdownCurriculum(markdown: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = markdown.split("\n");

  let currentSection: ParsedSection | null = null;
  let currentModule: ParsedModule | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Section header (## )
    if (trimmed.startsWith("## ") && !trimmed.startsWith("### ")) {
      if (currentModule && currentSection) {
        currentSection.modules.push(currentModule);
      }
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: trimmed.replace("## ", "").trim(),
        modules: [],
      };
      currentModule = null;
      continue;
    }

    // Module header (### )
    if (trimmed.startsWith("### ")) {
      if (currentModule && currentSection) {
        currentSection.modules.push(currentModule);
      }
      currentModule = {
        title: trimmed.replace("### ", "").trim(),
        topics: [],
      };
      continue;
    }

    // Topic item (- or * )
    if (
      (trimmed.startsWith("- ") || trimmed.startsWith("* ")) &&
      currentModule
    ) {
      const topic = trimmed.replace(/^[-*]\s+/, "").trim();
      if (topic) {
        currentModule.topics.push(topic);
      }
      continue;
    }

    // Numbered item
    if (/^\d+\.\s/.test(trimmed) && currentModule) {
      const topic = trimmed.replace(/^\d+\.\s+/, "").trim();
      if (topic) {
        currentModule.topics.push(topic);
      }
      continue;
    }

    // Plain text as topic
    if (trimmed && currentModule && !trimmed.startsWith("#")) {
      currentModule.topics.push(trimmed);
    }
  }

  // Push last module and section
  if (currentModule && currentSection) {
    currentSection.modules.push(currentModule);
  }
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}
