// prompts/emailPrompt.builder.ts

import app_info from "src/constants/app_info.js";
import {
    AUDIENCE_CONTEXT,
    EMAIL_SYSTEM_PERSONA,
    EMAIL_TEMPLATES,
    HTML_DESIGN_SYSTEM,
    PREVIEW_MAX_LENGTH,
    SUBJECT_MAX_LENGTH,
    TONE_GUIDELINES,
} from "src/constants/GEMINI_CONST.js";
import type { GenerateEmailContentParams } from "src/types/ai.type.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function divider(label?: string): string {
    if (!label) return "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
    const pad = Math.max(0, Math.floor((38 - label.length - 2) / 2));
    const line = "━".repeat(pad);
    return `${line} ${label} ${line}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate Email Prompt
// ─────────────────────────────────────────────────────────────────────────────

export function buildEmailPrompt(params: GenerateEmailContentParams): string {
    const {
        campaignType,
        targetAudience,
        tone,
        subject,
        keyPoints = [],
        additionalContext,
        brandName = app_info.name,
        brandColor = app_info.primaryColor,
        senderName = `The ${app_info.name} Team`,
        language = "English",
    } = params;

    const sections: (string | null)[] = [

        // ── Identity ──────────────────────────────────────────────────────────
        `${divider("SYSTEM ROLE")}
${EMAIL_SYSTEM_PERSONA}`,

        // ── Brand Context ─────────────────────────────────────────────────────
        `${divider("BRAND CONTEXT")}
Name:         ${brandName}
Primary Color:${brandColor}
Secondary:    ${app_info.secondaryColor}
Signed off by:${senderName}
Support:      ${app_info.support.email} | ${app_info.support.website}
Description:  ${app_info.description}`,

        // ── Campaign Brief ────────────────────────────────────────────────────
        `${divider("CAMPAIGN BRIEF")}
EMAIL TYPE:       ${EMAIL_TEMPLATES[campaignType]}
TARGET AUDIENCE:  ${AUDIENCE_CONTEXT[targetAudience]}
TONE & STYLE:     ${TONE_GUIDELINES[tone]}
LANGUAGE:         Generate the complete email strictly in ${language}.`,

        // ── Subject Direction ─────────────────────────────────────────────────
        subject
            ? `SUBJECT DIRECTION: "${subject}" — use this as a creative springboard. Sharpen, improve, or adapt it to maximise open rates while staying true to the campaign goal.`
            : `SUBJECT: Generate the single most compelling subject line for this campaign type and audience. Prioritise curiosity or clear benefit over cleverness.`,

        // ── Key Messages ──────────────────────────────────────────────────────
        keyPoints.length > 0
            ? `${divider("KEY MESSAGES")}
Every point below MUST be addressed — weave them naturally into the copy, do not list them verbatim:
${keyPoints.map((p, i) => `  ${i + 1}. ${p}`).join("\n")}`
            : null,

        // ── Additional Context ────────────────────────────────────────────────
        additionalContext
            ? `${divider("CONTEXT & CONSTRAINTS")}
${additionalContext}`
            : null,

        // ── Copywriting Standards ─────────────────────────────────────────────
        `${divider("COPYWRITING STANDARDS")}
STRUCTURE
  • Open with a hook that speaks directly to the reader's pain point or aspiration — first sentence decides whether they read on
  • Use the PAS framework where appropriate: Problem → Agitate → Solve
  • Lead with value ("what's in it for me?"), never with features
  • One primary CTA per email — clear, action-oriented verb (e.g. "Start Learning", "Claim Your Spot", "See What's New")
  • Close with a warm, on-brand sign-off from ${senderName}

SUBJECT & PREVIEW
  • Subject line: max ${SUBJECT_MAX_LENGTH} chars — create curiosity or urgency, never clickbait
  • Preview text: max ${PREVIEW_MAX_LENGTH} chars — complement (never repeat) the subject; treat it as a second hook

COPY STYLE
  • Paragraphs: 1–3 sentences max — white space is not wasted space
  • Reading level: Grade 7–9 (clear and accessible, not dumbed-down)
  • Avoid: passive voice, filler phrases ("We are pleased to inform you…"), excessive exclamation marks
  • Personalisation token: use {{first_name}} where a personal greeting adds warmth

WHAT TO AVOID
  • Spam trigger words: FREE!!!, URGENT, CLICK NOW, ACT IMMEDIATELY
  • Overloading with multiple CTAs or links
  • Generic openers: "I hope this email finds you well"`,

        // ── Design System ─────────────────────────────────────────────────────
        HTML_DESIGN_SYSTEM,

        // ── Output Format ─────────────────────────────────────────────────────
        `${divider("OUTPUT FORMAT")}
Respond with ONLY a valid JSON object.
No markdown fences. No commentary. No keys outside this schema.

{
  "subject":     "Subject line (max ${SUBJECT_MAX_LENGTH} characters)",
  "previewText": "Preview/preheader text (max ${PREVIEW_MAX_LENGTH} characters)",
  "content":     "Complete, production-ready HTML email — inline styles only, no <script>, no external CSS"
}`,
    ];

    return sections.filter(Boolean).join("\n\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Improve Email Prompt
// ─────────────────────────────────────────────────────────────────────────────

export function buildImproveEmailPrompt(
    content: string,
    instruction: string,
    language?: string
): string {
    return `${divider("SYSTEM ROLE")}
You are a senior email copywriter and HTML email specialist at ${app_info.name}.
Your task is to improve an existing email based on a specific instruction — not rewrite it from scratch.

${divider("IMPROVEMENT INSTRUCTION")}
"${instruction}"

${divider("CONSTRAINTS")}
• Preserve the original email's structure, intent, and key messages
• Apply ONLY what the instruction asks — do not add unrequested changes
• Maintain full email-client compatibility (inline styles only, no JavaScript, no external CSS)
• Keep brand colors: primary ${app_info.primaryColor}, secondary ${app_info.secondaryColor}
• Brand name is always written as "${app_info.name}"
${language ? `• Output language must be: ${language}` : ""}

${divider("CURRENT EMAIL CONTENT")}
${content}

${divider("OUTPUT FORMAT")}
Respond with ONLY the improved HTML content.
No explanations. No markdown. No code fences. Raw HTML only.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Subject Line Suggestions Prompt
// ─────────────────────────────────────────────────────────────────────────────

export function buildSubjectSuggestionsPrompt(
    content: string,
    count: number,
    language?: string
): string {
    return `${divider("SYSTEM ROLE")}
You are a conversion-focused email strategist at ${app_info.name}.
Generate ${count} subject line options for the email below — each using a distinct psychological angle.

${divider("SUBJECT LINE STRATEGIES")}
Cover a variety of these approaches across your ${count} suggestions:
  1. Curiosity gap       — tease without revealing ("The one thing holding your learners back")
  2. Benefit-led         — lead with the outcome ("Master Python in 30 days")
  3. Urgency / scarcity  — deadline or limited availability ("Only 48 hours left")
  4. Social proof        — numbers or peer validation ("10,000 learners can't be wrong")
  5. Question            — provoke self-reflection ("Are you learning as fast as your peers?")
  6. Personalisation     — speak directly ("{{first_name}}, your next course is ready")
  7. Bold claim          — make a memorable statement

RULES:
  • Each subject: max ${SUBJECT_MAX_LENGTH} characters
  • No clickbait, spam words (FREE!!!, URGENT), or excessive punctuation
  • Brand name "${app_info.name}" may be used sparingly — only when it adds trust
${language ? `  • All suggestions must be written in ${language}` : ""}

${divider("EMAIL CONTENT")}
${content}

${divider("OUTPUT FORMAT")}
Respond with ONLY a valid JSON array of exactly ${count} strings.
No markdown. No numbering. No explanations.

["Subject 1", "Subject 2", ..., "Subject ${count}"]`;
}