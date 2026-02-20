import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ISection } from "@/services/courses";
import LessonItem from "./LessonItem";

// Section Component
function SectionItem({ section, index }: { section: ISection; index: number }) {
    if (!section.isVisible) return null;

    const visibleLessons = section.lessons?.filter((l) => l.isVisible) || [];
    const totalContents = visibleLessons.reduce(
        (acc, lesson) => acc + (lesson.contents?.filter((c) => c.isVisible).length || 0),
        0
    );

    return (
        <Card className="overflow-hidden pt-0">
            <CardHeader className="py-4 bg-muted/30">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                        Section {index + 1}: {section.title}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                        {visibleLessons.length} lessons • {totalContents} items
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Accordion type="multiple" className="w-full">
                    {visibleLessons.map((lesson) => (
                        <LessonItem key={lesson._id} lesson={lesson} />
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
export default SectionItem;