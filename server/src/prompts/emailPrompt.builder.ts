// prompts/emailPrompt.builder.ts

import { AUDIENCE_CONTEXT, EMAIL_SYSTEM_PERSONA, EMAIL_TEMPLATES, HTML_DESIGN_SYSTEM, PREVIEW_MAX_LENGTH, SUBJECT_MAX_LENGTH, TONE_GUIDELINES } from "src/constants/GEMINI_CONST.js";
import type { GenerateEmailContentParams } from "src/types/ai.type.js";

export function buildEmailPrompt(params: GenerateEmailContentParams): string {
    const {
        campaignType,
        targetAudience,
        tone,
        subject,
        keyPoints = [],
        additionalContext,
        brandName = "EduApp",
        brandColor = "#3b82f6",
        senderName = "The EduApp Team",
    } = params;

    const sections = [
        `SYSTEM ROLE:\n${EMAIL_SYSTEM_PERSONA}`,

        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAMPAIGN BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,

        `BRAND: ${brandName} (color: ${brandColor}, signed off by: ${senderName})`,
        `EMAIL TYPE: ${EMAIL_TEMPLATES[campaignType]}`,
        `TARGET AUDIENCE: ${AUDIENCE_CONTEXT[targetAudience]}`,
        `TONE & STYLE: ${TONE_GUIDELINES[tone]}`,

        subject
            ? `SUBJECT DIRECTION: "${subject}" — improve or adapt this as needed`
            : `SUBJECT: Generate the most compelling subject line for this campaign`,

        keyPoints.length > 0
            ? `KEY MESSAGES (must address all):\n${keyPoints.map((p, i) => `  ${i + 1}. ${p}`).join("\n")}`
            : null,

        additionalContext
            ? `CONTEXT & CONSTRAINTS:\n${additionalContext}`
            : null,

        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COPYWRITING STANDARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Open with a hook that speaks directly to the reader's pain point or aspiration
- Lead with value, not features — answer "what's in it for me?" immediately
- Use the PAS framework where appropriate (Problem → Agitate → Solve)
- One primary CTA per email — clear, action-oriented verb ("Start Learning", "Claim Your Spot")
- Subject line: Max ${SUBJECT_MAX_LENGTH} chars, creates curiosity or urgency without clickbait
- Preview text: Max ${PREVIEW_MAX_LENGTH} chars, complements (never repeats) the subject line
- Paragraphs: 1–3 sentences max. White space is your friend.
- Reading level: Grade 7–9 (clear and accessible, not dumbed-down)`,

        HTML_DESIGN_SYSTEM.replace("{BRAND_COLOR}", brandColor),

        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Respond with ONLY a valid JSON object — no markdown, no code fences, no commentary.

{
  "subject": "Subject line (max ${SUBJECT_MAX_LENGTH} characters)",
  "previewText": "Preview/preheader text (max ${PREVIEW_MAX_LENGTH} characters)",
  "content": "Complete, production-ready HTML email body"
}`,
    ];

    return sections.filter(Boolean).join("\n\n");
}

export function buildImproveEmailPrompt(content: string, instruction: string): string {
    return `You are an expert email copywriter. Improve the following email content based on this instruction: "${instruction}"

CURRENT EMAIL CONTENT:
${content}

INSTRUCTIONS:
1. Maintain the original structure and key message
2. Apply the requested improvements
3. Keep Email compatibility with inline styles
4. Return ONLY the improved HTML content, no explanations

Respond with ONLY the improved HTML content.`;
}

export function buildSubjectSuggestionsPrompt(content: string, count: number): string {
    return `Based on the following email content, generate ${count} compelling subject line suggestions. Each should be unique in approach (e.g., question, urgency, benefit-focused, curiosity).

EMAIL CONTENT:
${content}

Respond with ONLY a JSON array of strings, no other text:
["Subject 1", "Subject 2", ...]`;
}