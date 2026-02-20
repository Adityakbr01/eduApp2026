export default function isAllowedFile(
    file: File,
    accept?: Record<string, string[]>
): boolean {
    if (!accept) return true;

    const fileType = file.type || "";
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";

    return Object.entries(accept).some(([acceptType, acceptedExtensions]) => {
        // Case 1: Wildcard like "image/*"
        if (acceptType.endsWith("/*")) {
            const base = acceptType.slice(0, -1); // "image/"
            return fileType.startsWith(base);
        }

        // Case 2: Exact MIME type like "application/pdf"
        if (fileType === acceptType) {
            return true;
        }

        // Case 3: Extension-only like ".pdf"
        if (acceptType.startsWith(".")) {
            const ext = acceptType.slice(1).toLowerCase();
            if (fileExt === ext) return true;

            // Also check if any of the allowed extensions match
            return acceptedExtensions.some((e) => {
                const cleanExt = e.startsWith(".") ? e.slice(1) : e;
                return fileExt === cleanExt.toLowerCase();
            });
        }

        // Case 4: MIME type with allowed extensions (e.g. "application/pdf": [".pdf"])
        if (acceptedExtensions.length > 0) {
            return acceptedExtensions.some((ext) => {
                const cleanExt = ext.toLowerCase().replace(/^\.+/, ""); // remove leading dots
                return fileExt === cleanExt;
            });
        }

        return false;
    });
}