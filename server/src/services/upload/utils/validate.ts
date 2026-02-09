
interface ValidationRule {
    max: number; // MB
    mime: string[];
}

const RULES: Record<string, ValidationRule> = {
    profile_image: {
        max: 5,
        mime: ["image/png", "image/jpeg", "image/webp", "image/gif"]
    },
    course_thumbnail: {
        max: 5,
        mime: ["image/png", "image/jpeg", "image/webp", "image/gif"]
    },
    lesson_video: {
        max: 2048,
        mime: ["video/mp4", "video/webm", "video/quicktime"]
    },
    lesson_audio: {
        max: 100,
        mime: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/mp4", "audio/webm", "audio/flac"]
    },
    lesson_pdf: {
        max: 50,
        mime: ["application/pdf"]
    },
};

export function validateFile(type: string, size: number, mime: string): void {
    const rule = RULES[type];
    if (!rule) {
        throw new Error(`Invalid file type: ${type}`);
    }

    if (!rule.mime.includes(mime)) {
        throw new Error(`Invalid mime type: ${mime}. Allowed: ${rule.mime.join(", ")}`);
    }

    if (size > rule.max * 1024 * 1024) {
        throw new Error(`File too large. Maximum size: ${rule.max}MB`);
    }
}
