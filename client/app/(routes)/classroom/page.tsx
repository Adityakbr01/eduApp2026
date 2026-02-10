"use client";

import CourseCard from "@/components/Classroom/CourseCard";
import Heatmap from "@/components/Classroom/Heatmap";
import Notifications from "@/components/Classroom/Notifications";
import { useGetClassroomData } from "@/services/classroom";
import Link from "next/link";
import { ArrowLeft, ArrowUpDown, Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { getS3PublicUrl } from "../dashboard/Instructor/courses/create/getS3PublicUrl";

const ClassroomPage = () => {
  const { data, isLoading, isError } = useGetClassroomData();
  const courses = data?.data?.courses || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((course) =>
        course.title.toLowerCase().includes(query),
      );
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [courses, searchQuery, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
  };

  return (
    <div className="relative flex flex-col w-full bg-[#171717] p-1 md:py-2 md:px-2 gap-5 min-h-screen lg:h-screen lg:overflow-hidden lg:flex-row text-white">
      {/* Left Column - Courses */}
      <div className="rounded-2xl flex flex-col relative flex-1 border border-white/5 p-0! min-h-[500px] lg:min-h-[50%] font-apfel max-lg:w-full lg:h-full overflow-hidden bg-dark-card! text-white/80 platform">
        <Link href={"/"}>
          <h1 className="text-2xl text-white bg-dark-extra-light p-4 px-8 flex items-center gap-2 border-b border-white/5">
            <ArrowLeft className="w-4 h-4 animate-out" />
            Classroom
          </h1>
        </Link>
        <div className="flex px-5 md:px-7 sm:flex-row flex-col gap-3 justify-between md:items-center py-4 my-3">
          <h1 className="text-xl text-white whitespace-nowrap">
            Your Enrolled Courses
          </h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:w-fit w-full gap-3">
            <div className="relative flex-1 sm:min-w-[200px]">
              <Search className="text-white/30 absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
              <input
                type="text"
                className="w-full pl-9 rounded-md border bg-dark-light/3 placeholder:text-white/50 border-white/10 px-3 py-2 focus:border-primary/50 focus:outline-none sm:text-lg text-white"
                maxLength={200}
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={toggleSort}
              className="flex items-center justify-center gap-2 rounded-md border text-white/50 border-white/10 px-3 py-2 sm:text-lg hover:bg-white/5 transition-colors whitespace-nowrap"
            >
              <h1>Sort By {sortOrder === "newest" ? "Oldest" : "Newest"}</h1>
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="h-full overflow-y-auto px-5 md:px-7 pb-20 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-white/50">Loading your courses...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <p className="text-red-400">
                Failed to load courses. Please try again.
              </p>
            </div>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                date={new Date(course.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                progress={course.progress}
                image={getS3PublicUrl(course.image.key!) as string}
                links={course.links}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <p className="text-white/50">
                {searchQuery
                  ? `No enrolled courses found for "${searchQuery}"`
                  : "You haven't enrolled in any courses yet."}
              </p>
              <Link
                href={
                  searchQuery
                    ? `/courses?query=${encodeURIComponent(searchQuery)}`
                    : "/courses"
                }
                className="text-primary hover:text-primary/80 underline underline-offset-4 text-sm transition-colors"
              >
                {searchQuery
                  ? "Search in all available courses →"
                  : "Browse courses →"}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Notifications & Heatmap */}
      <div className="w-[35%] max-lg:min-h-[500px] flex flex-col gap-5 max-lg:w-full">
        {/* Notifications */}
        <div className="rounded-2xl flex flex-col relative flex-1 w-full justify-between overflow-hidden bg-dark-card! text-white/80 platform border border-white/5 p-0!">
          <div className="flex items-center gap-2 pe-12 w-full shadow-md shadow-black/5 h-16 shrink-0 px-6 text-xl text-white/80 bg-dark-extra-light mb-3 border-b border-white/10">
            All Notifications
          </div>
          <div className="flex flex-col gap-0 p-0 h-full w-full overflow-hidden">
            <Notifications />
          </div>
        </div>

        {/* Heatmap */}
        <div className="rounded-2xl flex flex-col relative flex-1 bg-dark-card! text-white/80 platform border border-white/5 p-0!">
          <Heatmap />
        </div>
      </div>
    </div>
  );
};

export default ClassroomPage;
