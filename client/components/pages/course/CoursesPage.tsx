"use client";
import { Suspense } from "react";
import CoursesPageContent from "./CoursesPageContent";
import CoursesPageFallback from "./CoursesPageFallback";



export function CoursesPage() {
    return (
        <Suspense fallback={<CoursesPageFallback />}>
            <CoursesPageContent />
        </Suspense>
    );
}
