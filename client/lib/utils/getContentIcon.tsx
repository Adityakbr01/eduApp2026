import { ContentType } from "@/services/courses";
import { ClipboardList, FileQuestion, FileText, PlayCircle, Video } from "lucide-react";

// Content type icon mapping
function getContentIcon(type: ContentType) {
    switch (type) {
        case ContentType.VIDEO:
            return <Video className="size-4" />;
        case ContentType.PDF:
            return <FileText className="size-4" />;
        case ContentType.QUIZ:
            return <FileQuestion className="size-4" />;
        case ContentType.ASSIGNMENT:
            return <ClipboardList className="size-4" />;
        case ContentType.TEXT:
            return <FileText className="size-4" />;
        case ContentType.AUDIO:
            return <PlayCircle className="size-4" />;
        default:
            return <FileText className="size-4" />;
    }
}

export default getContentIcon;