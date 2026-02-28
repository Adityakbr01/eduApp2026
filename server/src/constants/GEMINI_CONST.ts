import { env } from "src/configs/env.js";
import app_info from "./app_info.js";

export const EMAIL_TEMPLATES = {
    welcome: "a warm, inspiring welcome email for new users joining our educational platform — celebrate their first step toward growth",
    promotion: "a compelling promotional email highlighting special offers or discounts — create excitement and drive immediate action",
    courseUpdate: "an informative, engaging email about course updates or newly released content — emphasize the learner's benefit",
    newsletter: "a polished newsletter with platform highlights, learning tips, and community updates — build habit and loyalty",
    announcement: "a clear, high-impact announcement email — communicate importance while maintaining trust",
    reminder: "a warm, motivating reminder email — re-engage without pressure, inspire action",
    custom: "a tailored email crafted around the provided context and goals",
};

export const TONE_GUIDELINES = {
    professional:
        "Authoritative yet approachable. Use precise language, structured paragraphs, and confident assertions. Avoid jargon — clarity is professionalism.",
    friendly:
        "Warm, human, and encouraging. Write like a knowledgeable friend — supportive, genuine, never condescending.",
    urgent:
        "Direct and time-aware. Lead with stakes, use action verbs, and create a clear sense of deadline — without resorting to scare tactics.",
    casual:
        "Conversational and energetic. Short sentences, contractions welcome, personality over formality — still credible and on-brand.",
};

export const AUDIENCE_CONTEXT = {
    students:
        "ambitious learners on our platform — motivated by growth, career advancement, and skill mastery. Speak to their aspirations.",
    instructors:
        "expert educators and course creators — value their time, respect their expertise, and highlight tools that amplify their impact.",
    all: "a diverse community of students, instructors, and staff — use inclusive, platform-wide language that resonates across roles.",
    managers:
        "platform administrators and decision-makers — data-informed, efficiency-focused, and responsible for team outcomes.",
};

// ─────────────────────────────────────────────
// AI & Email Configuration
// ─────────────────────────────────────────────
export const AI_MODEL_VERSION = env.GEMINI_MODEL;
export const MAX_RETRIES = 2;
export const SUBJECT_MAX_LENGTH = 60;
export const PREVIEW_MAX_LENGTH = 100;

export const EMAIL_SYSTEM_PERSONA = `You are a senior B2B/B2C email marketing strategist with 10+ years of experience 
writing high-converting SaaS and EdTech campaigns for EduApp — a modern educational platform 
dedicated to learning, collaboration, and career growth.

You craft emails that balance persuasion with authenticity, driving measurable engagement 
while always reflecting EduApp's brand: bold, human, and results-driven.`;

export const HTML_DESIGN_SYSTEM = `
EDUAPP DESIGN SYSTEM & HTML GUIDELINES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BRAND COLORS:
  • Primary (CTA, accents, highlights): ${app_info.primaryColor}  — EduApp Orange
  • Secondary (headers, dark sections):  ${app_info.secondaryColor}  — EduApp Charcoal
  • Body text:                           #374151  — Neutral Gray
  • Background:                          #f9fafb  — Off-White
  • Surface / card:                      #ffffff  — White
  • Muted text / footer:                 #6b7280  — Slate

STRUCTURE:
  • Outer wrapper: max-width 600px, margin auto, background #f9fafb
  • Header band: background ${app_info.secondaryColor}, padding 28px 24px, logo + brand name in ${app_info.primaryColor}
  • Body section: background #ffffff, padding 32px 28px, border-radius 8px, margin 16px 0
  • CTA section: centered, padding 24px 0
  • Footer: background ${app_info.secondaryColor}, color #6b7280, font-size 13px, padding 24px

TYPOGRAPHY:
  • Font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
  • Heading (h1/h2): color ${app_info.secondaryColor}, font-weight 700, font-size 24–28px, line-height 1.3
  • Body text: color #374151, font-size 16px, line-height 1.7
  • Small/muted: color #6b7280, font-size 14px

CTA BUTTON (primary):
  style="display:inline-block; background-color:${app_info.primaryColor}; color:#ffffff;
         padding:14px 32px; border-radius:8px; font-weight:700; font-size:16px;
         text-decoration:none; letter-spacing:0.4px; margin:12px 0;
         font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"

ACCENT ELEMENTS:
  • Use a 3px left border in ${app_info.primaryColor} for pull-quotes or highlighted callouts
  • Use subtle dividers: border-top: 1px solid #e5e7eb
  • Highlight spans: background #fff3ef (light orange tint), color ${app_info.primaryColor}, padding 2px 6px, border-radius 4px

RULES:
  • Inline styles only — no external CSS, no JavaScript
  • Responsive: percentage widths, fluid images (max-width:100%)
  • Accessibility: alt text on all images, minimum 4.5:1 color contrast
  • Avoid: heavy graphics, ALL CAPS headers, spam trigger words (FREE!!!, CLICK NOW, etc.)
  • Spacing: 24px between sections, 16px between paragraphs
  • Brand name always: ${app_info.name} (not "Eduapp" or "EDUAPP")
`;