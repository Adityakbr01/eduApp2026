import { IThumbnail, SocialLink } from "@/services/courses";

// ==================== INTERFACES ====================

export interface ClassroomCourse {
    id: string;
    title: string;
    date: string;
    progress: number;
    image: IThumbnail;
    links: SocialLink[];
    enrolledAt: string;
}

// ==================== RESPONSE ====================

export interface ClassroomDataResponse {
    courses: ClassroomCourse[];
}
