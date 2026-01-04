import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ContentItem from "@/lib/utils/ContentItem";
import { ILesson } from "@/services/courses";

// Lesson Component
function LessonItem({ lesson }: { lesson: ILesson }) {
    if (!lesson.isVisible) return null;

    return (
        <AccordionItem value={lesson._id} className="border-none">
            <AccordionTrigger className="hover:no-underline py-3 px-2">
                <span className="text-sm font-medium">{lesson.title}</span>
            </AccordionTrigger>
            <AccordionContent className="pl-4 space-y-1">
                {lesson.contents?.filter((c) => c.isVisible).map((content) => (
                    <ContentItem key={content._id} content={content} />
                ))}
            </AccordionContent>
        </AccordionItem>
    );
}


export default LessonItem;