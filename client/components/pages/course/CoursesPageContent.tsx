"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Filter,
    Search
} from "lucide-react";

import { useGetCategoriesWithSubcategories } from "@/services/categories";
import { CourseLevel, useGetPublishedCourses } from "@/services/courses";
import CourseCard from "./CourseCard";
import CourseCardSkeleton from "./CourseCardSkeleton";

const ITEMS_PER_PAGE = 12;

const levelOptions = [
    { value: "all", label: "All Levels" },
    { value: CourseLevel.BEGINNER, label: "Beginner" },
    { value: CourseLevel.INTERMEDIATE, label: "Intermediate" },
    { value: CourseLevel.ADVANCED, label: "Advanced" },
];


function CoursesPageContent() {
    const searchParams = useSearchParams();

    // State
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
    const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || 'all');
    const [currentPage, setCurrentPage] = useState(1);

    // Queries
    const { data: coursesData, isLoading: coursesLoading } = useGetPublishedCourses();
    const { data: categoriesData } = useGetCategoriesWithSubcategories();

    const courses = coursesData?.data?.courses || [];
    const categories = categoriesData?.data?.categories || [];

    // Filter courses
    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            // Search filter
            const matchesSearch = searchQuery.trim() === '' ||
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());

            // Category filter
            const categoryId = typeof course.category === 'object' ? course.category._id : course.category;
            const matchesCategory = selectedCategory === 'all' || categoryId === selectedCategory;

            // Level filter
            const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;

            return matchesSearch && matchesCategory && matchesLevel;
        });
    }, [courses, searchQuery, selectedCategory, selectedLevel]);

    // Pagination
    const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
    const paginatedCourses = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCourses.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCourses, currentPage]);

    // Reset page when filters change
    const handleFilterChange = (type: 'category' | 'level', value: string) => {
        setCurrentPage(1);
        if (type === 'category') {
            setSelectedCategory(value);
        } else {
            setSelectedLevel(value);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-primary/10 to-background py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            Explore Our Courses
                        </h1>
                        <p className="text-lg text-muted-foreground mb-8">
                            Discover courses that will help you grow your skills and advance your career
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit">Search</Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 md:px-20 py-8">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    <div className="flex items-center gap-2">
                        <Filter className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    <Select
                        value={selectedCategory}
                        onValueChange={(value) => handleFilterChange('category', value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat._id} value={cat._id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={selectedLevel}
                        onValueChange={(value) => handleFilterChange('level', value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                            {levelOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Results count */}
                    <div className="ml-auto text-sm text-muted-foreground">
                        {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
                    </div>
                </div>

                {/* Course Grid */}
                {coursesLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <CourseCardSkeleton key={i} />
                        ))}
                    </div>
                ) : paginatedCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <BookOpen className="size-16 text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No courses found</h2>
                        <p className="text-muted-foreground mb-4">
                            Try adjusting your search or filters
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                                setSelectedLevel('all');
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedCourses.map((course) => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter((page) => {
                                            // Show first, last, current, and adjacent pages
                                            return (
                                                page === 1 ||
                                                page === totalPages ||
                                                Math.abs(page - currentPage) <= 1
                                            );
                                        })
                                        .map((page, index, arr) => (
                                            <span key={page} className="flex items-center">
                                                {index > 0 && arr[index - 1] !== page - 1 && (
                                                    <span className="px-2 text-muted-foreground">...</span>
                                                )}
                                                <Button
                                                    variant={currentPage === page ? "default" : "outline"}
                                                    size="icon"
                                                    onClick={() => setCurrentPage(page)}
                                                >
                                                    {page}
                                                </Button>
                                            </span>
                                        ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}


export default CoursesPageContent;