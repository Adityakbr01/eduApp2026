export const EMAIL_TEMPLATES = {
    welcome: "a warm welcome email for new users joining our platform",
    promotion: "a promotional email highlighting special offers or discounts",
    courseUpdate: "an informative email about course updates or new content",
    newsletter: "an engaging newsletter with platform updates and highlights",
    announcement: "an important announcement email",
    reminder: "a friendly reminder email",
    custom: "a custom email based on the provided context",
};

export const TONE_GUIDELINES = {
    professional: "Use formal language, clear structure, and maintain a business-appropriate tone.",
    friendly: "Use warm, approachable language while remaining respectful and helpful.",
    urgent: "Emphasize time-sensitivity and importance while maintaining professionalism.",
    casual: "Use conversational language that feels personal and relatable.",
};

export const AUDIENCE_CONTEXT = {
    students: "learners who are taking courses on our platform",
    instructors: "course creators and teachers on our platform",
    all: "all users including students, instructors, and staff",
    managers: "platform managers and administrators",
};




// constants/email.constants.ts
export const AI_MODEL_VERSION = "gemini-1.5-pro";
export const MAX_RETRIES = 2;
export const SUBJECT_MAX_LENGTH = 60;
export const PREVIEW_MAX_LENGTH = 100;

export const EMAIL_SYSTEM_PERSONA = `You are a senior B2B/B2C email marketing strategist with 10+ years of experience 
writing high-converting SaaS and EdTech campaigns. You specialize in crafting emails that balance 
persuasion with authenticity, driving measurable engagement without sounding spammy or generic.`;

export const HTML_DESIGN_SYSTEM = `
DESIGN SYSTEM & HTML GUIDELINES:
- Structure: Outer wrapper (max-width: 600px, margin: auto), header, body, CTA section, footer
- Typography: System fonts: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- Spacing: Consistent padding (24px sections, 16px paragraphs)
- Colors: Use brand color for CTAs and accents, neutrals for body text (#374151)
- CTA Button: style="display:inline-block; background-color:{BRAND_COLOR}; color:#ffffff; 
  padding:14px 28px; border-radius:8px; font-weight:600; font-size:16px; 
  text-decoration:none; letter-spacing:0.3px; margin:8px 0;"
- Responsive: Use percentage widths and fluid images
- Accessibility: Alt text on images, sufficient color contrast (4.5:1 minimum)
- Compatibility: Inline styles only, no external CSS, no JavaScript
- Avoid: Heavy graphics, excessive punctuation, spam trigger words (FREE!!!, URGENT, etc.)
`;