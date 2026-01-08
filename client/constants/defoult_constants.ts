import { CourseLevel } from "@/services/courses";

export const ITEMS_PER_PAGE = 12;

export const levelOptions = [
    { value: "all", label: "All Levels" },
    { value: CourseLevel.BEGINNER, label: "Beginner" },
    { value: CourseLevel.INTERMEDIATE, label: "Intermediate" },
    { value: CourseLevel.ADVANCED, label: "Advanced" },
];