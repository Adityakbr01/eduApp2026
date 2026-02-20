// Loading Skeleton
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function CourseCardSkeleton() {
    return (
        <Card className="overflow-hidden pt-0">
            <Skeleton className="h-48 w-full" />
            <CardHeader className="pb-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-full mt-2" />
            </CardHeader>
            <CardContent className="pb-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-1" />
            </CardContent>
            <CardFooter className="pt-2 border-t">
                <Skeleton className="h-3 w-full" />
            </CardFooter>
        </Card>
    );
}

export default CourseCardSkeleton;