import { ContentType, ILessonContent } from "@/services/courses";
import getContentIcon from "./getContentIcon";
import { Badge } from "@/components/ui/badge";
import { Eye, Lock } from "lucide-react";
import { formatDuration } from "./formatDuration";

// Content Item Component
function ContentItem({ content }: { content: ILessonContent }) {
    const isPreview = content.isPreview;

    return (
        <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                    {getContentIcon(content.type as ContentType)}
                </span>
                <span className="text-sm">{content.title}</span>
                {isPreview && (
                    <Badge variant="outline" className="text-xs">
                        <Eye className="size-3 mr-1" />
                        Preview
                    </Badge>
                )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {content.video?.duration && (
                    <span>{formatDuration(content.video.duration)}</span>
                )}
                {!isPreview && <Lock className="size-3" />}
            </div>
        </div>
    );
}
export default ContentItem;