import { Skeleton } from "@/components/ui/skeleton";
import CourseCardSkeleton from "./CourseCardSkeleton";

// Loading fallback for Suspense
function CoursesPageFallback() {
    return (
        <div className="min-h-screen bg-background">
            <div className="bg-gradient-to-b from-primary/10 to-background py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <Skeleton className="h-10 w-64 mx-auto mb-4" />
                        <Skeleton className="h-6 w-96 mx-auto mb-8" />
                        <Skeleton className="h-10 w-full max-w-xl mx-auto" />
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 md:px-20 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <CourseCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CoursesPageFallback;