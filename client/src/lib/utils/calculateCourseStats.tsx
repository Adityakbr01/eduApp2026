import { ISection } from "@/services/courses";

// Calculate total course stats
function calculateCourseStats(sections?: ISection[]) {
    let totalLessons = 0;
    let totalContents = 0;
    let totalDuration = 0;

    sections?.forEach((section) => {
        totalLessons += section.lessons?.length || 0;
        section.lessons?.forEach((lesson) => {
            totalContents += lesson.contents?.length || 0;
            lesson.contents?.forEach((content) => {
                if (content.video?.duration) {
                    totalDuration += content.video.duration;
                }
            });
        });
    });

    return { totalLessons, totalContents, totalDuration };
}

export default calculateCourseStats;