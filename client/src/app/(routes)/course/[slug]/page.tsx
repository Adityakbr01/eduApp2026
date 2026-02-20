import { Metadata } from "next";
import { CourseDetailPage } from "@/components/pages/course/CourseDetailPage";

export const metadata: Metadata = {
    title: "Course Details",
    description: "View course details, curriculum and enroll",
};

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;
    return <CourseDetailPage slug={slug} />;
}