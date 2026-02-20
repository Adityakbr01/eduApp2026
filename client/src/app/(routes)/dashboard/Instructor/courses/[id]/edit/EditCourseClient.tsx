"use client";

import { useParams } from "next/navigation";
import { CourseForm } from "@/components/pages/dashboards/instructor/courses/CourseFormComp/CourseForm";
import { useGetCourseById } from "@/services/courses";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function EditCourseClient() {
    const params = useParams();
    const courseId = params.id as string;

    const { data, isLoading, error } = useGetCourseById(courseId);
    const course = data?.data; // API response: { success, message, data: courseObject }

    if (isLoading) {
        return (
            <div className="container py-6 max-w-6xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <div>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64 mt-2" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-32 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                    <div>
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-40 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="container py-6 text-center">
                <p className="text-destructive">Failed to load course</p>
            </div>
        );
    }

    return (
        <div className="container py-6 px-4 md:px-0 mx-auto max-w-6xl">
            <CourseForm initialData={course} isEditing />
        </div>
    );
}
