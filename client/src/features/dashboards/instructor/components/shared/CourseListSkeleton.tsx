import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function CourseCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="h-40 rounded-none" />
            <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="pb-2 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter className="pt-2 flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
            </CardFooter>
        </Card>
    );
}

export function CourseListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <CourseCardSkeleton key={i} />
            ))}
        </div>
    );
}
