const RULES = {
    image: { max: 5, mime: ["image/png", "image/jpeg", "image/webp"] },
    video: { max: 2048, mime: ["video/mp4"] },
    pdf: { max: 50, mime: ["application/pdf"] }
};

export function validateFile(type, size, mime) {
    const rule = RULES[type];
    if (!rule) throw new Error("Invalid type");

    if (!rule.mime.includes(mime)) throw new Error("Invalid mime");
    if (size > rule.max * 1024 * 1024) throw new Error("Too large");
}
