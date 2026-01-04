"use client";

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BookCheckIcon,
    BookOpen,
    Calendar,
    Users,
    Video
} from "lucide-react";

import { ICourse } from "@/services/courses";


// Course Card Component

function CourseCard({ course }: { course: ICourse }) {
    const categoryName =
        typeof course.category === "object" ? course.category.name : "";
    const instructorName =
        typeof course.instructor === "object" ? course.instructor.name : "";

    return (
        <Link href={`/course/${course.slug || course._id}`} className="h-full">
            <Card className="group h-full overflow-hidden pt-0 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                {/* 🔥 Cover */}
                <div className="relative h-48 overflow-hidden bg-muted">
                    {course.coverImage ? (
                        <Image
                            src={course.coverImage}
                            alt={course.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/5">
                            <BookOpen className="size-16 text-muted-foreground transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" />
                        </div>
                    )}

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Level */}
                    <Badge className="absolute top-3 left-3" variant="destructive">
                        {course.level}
                    </Badge>

                    {/* Price */}
                    <Badge className="absolute bottom-3 right-3 text-sm font-semibold">
                        {course.pricing?.isFree
                            ? "Free"
                            : `${course.pricing?.currency || "$"}${course.pricing?.price || 0}`}
                    </Badge>
                </div>

                {/* 📌 Header */}
                <CardHeader className="">
                    {categoryName && (
                        <Badge variant="outline" className="w-fit text-xs text-primary">
                            {categoryName}
                        </Badge>
                    )}
                    <CardTitle className="text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                    </CardTitle>
                </CardHeader>

                {/* 📄 Content */}
                <CardContent className="flex-1 pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.shortDescription || course.description}
                    </p>

                    {/* Tags */}
                    {course.tags?.length ? (
                        <div className="mt-3 flex flex-wrap gap-1">
                            {course.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    ) : null}

                    {/* Meta */}
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                        {course.accessDuration && (
                            <div className="flex items-center gap-1">
                                <Calendar className="size-3 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12" />
                                <span>{course.accessDuration} days access</span>
                            </div>
                        )}

                        {course.deliveryMode && (
                            <div className="flex items-center gap-1">
                                <Video className="size-3 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
                                <span>{course.deliveryMode}</span>
                            </div>
                        )}
                    </div>
                </CardContent>

                {/* 👤 Footer */}
                <CardFooter className="border-t -mt-4">
                    <div className="flex items-center gap-5 justify-between w-full text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Users className="size-3 text-red-500 transition-all duration-300 group-hover:scale-125 group-hover:animate-pulse" />
                            <span>{instructorName || "Instructor"}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <BookCheckIcon className="size-3 text-green-600 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
                            <span>{course.language}</span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
export default CourseCard;