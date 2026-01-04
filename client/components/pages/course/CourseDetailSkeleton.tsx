import { Skeleton } from "@/components/ui/skeleton";

// Loading Skeleton
function CourseDetailSkeleton() {
    return (
        <div className="min-h-screen">
            {/* Hero Skeleton */}
            <div className="bg-muted/50 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <div className="flex gap-4">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        </div>
                        <div>
                            <Skeleton className="h-64 w-full rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
            {/* Content Skeleton */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <Skeleton className="h-80 w-full" />
                </div>
            </div>
        </div>
    );
}

export default CourseDetailSkeleton;