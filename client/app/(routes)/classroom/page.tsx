"use client";

import CourseCard from "@/components/Classroom/CourseCard";
import Heatmap from "@/components/Classroom/Heatmap";
import Notifications from "@/components/Classroom/Notifications";
import Link from "next/link";
import { ArrowUpDown, Search } from "lucide-react";
import { useMemo, useState } from "react";

const COURSES = [
  {
    id: "691dd880a4074343af9c23b5",
    title: "2.0 Job Ready AI Powered Cohort",
    date: "August 19, 2025",
    progress: 4.6,
    image:
      "https://ik.imagekit.io/sheryians/Cohort%202.0/cohort-3_ekZjBiRzc-2_76HU4-Mz5z.jpeg?updatedAt=1757741949621",
    links: [
      { type: "discord", url: "https://discord.gg/cohort" },
      { type: "github", url: "https://github.com/sheryians/cohort-2.0" },
    ],
  },
  {
    id: "fullstack-web-dev",
    title: "Full Stack Web Development",
    date: "September 10, 2025",
    progress: 32,
    image:
      "https://ik.imagekit.io/sheryians/Cohort%202.0/cohort-3_ekZjBiRzc-2_76HU4-Mz5z.jpeg?updatedAt=1757741949621",
    links: [
      { type: "youtube", url: "https://youtube.com/playlist?list=..." },
      { type: "website", url: "https://sheryians.com" },
    ],
  },
];

const ClassroomPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const filteredCourses = useMemo(() => {
    let result = [...COURSES];

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
  }, [searchQuery, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
  };

  return (
    <div className="relative flex flex-col w-full bg-[#171717] py-7 px-5 gap-5 min-h-screen lg:h-screen lg:overflow-hidden lg:flex-row text-white">
      {/* Left Column - Courses */}
      <div className="rounded-2xl flex flex-col relative flex-1 border border-white/5 p-0! min-h-[500px] lg:min-h-[50%] font-apfel max-lg:w-full lg:h-full overflow-hidden bg-dark-card! text-white/80 platform">
        <h1 className="text-2xl text-white bg-dark-extra-light p-4 px-8 flex items-center gap-2 border-b border-white/5">
          Classroom
        </h1>

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
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              // @ts-ignore - links are dynamic now
              <CourseCard key={course.id} {...course} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <p className="text-white/50">
                No enrolled courses found for "{searchQuery}"
              </p>
              <Link
                href={`/courses?query=${encodeURIComponent(searchQuery)}`}
                className="text-primary hover:text-primary/80 underline underline-offset-4 text-sm transition-colors"
              >
                Search in all available courses →
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
