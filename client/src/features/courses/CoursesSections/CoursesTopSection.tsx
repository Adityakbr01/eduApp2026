"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { BookOpen } from "lucide-react";

import { ICourse, useGetPublishedCourses } from "@/services/courses";
import CourseCard from "@/features/course/components/CourseCard";
import CourseCardSkeleton from "@/features/course/components/CourseCardSkeleton";
import CornerDotsBox from "@/components/ui/CornerDotsBox";

function CoursesTopSection() {
  // Queries
  const { data: coursesData, isLoading: coursesLoading } =
    useGetPublishedCourses();

  const courses = useMemo(() => {
    return coursesData?.data?.courses || [];
  }, [coursesData]);

  return (
    <motion.main
      className="relative min-h-screen text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Background */}
      <div className="absolute top-0 left-0 w-full -z-10 overflow-hidden">
        {/* Mobile */}
        <div className="block md:hidden relative w-full h-[80vh] sm:h-[90vh]">
          <Image
            src="https://dfdx9u0psdezh.cloudfront.net/common/Background_mobile.svg"
            alt="Course background mobile"
            fill
            priority
            sizes="100vw"
            className="object-center brightness-150 scale-150"
          />
        </div>

        {/* Desktop */}
        <div className="hidden md:block relative w-full h-[165vh]">
          <Image
            src="https://dfdx9u0psdezh.cloudfront.net/common/Background.svg"
            alt="Course background desktop"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[60%_60%] brightness-110 scale-110"
          />
        </div>
      </div>

      {/* Page Content */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.05,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Hero Section */}
        <section className="px-4 md:px-18 mt-14 md:mt-16 flex w-full flex-col items-center justify-center">
          {/* Badge */}

          <CornerDotsBox className="elative w-fit px-4 uppercase mx-auto bg-[#e8602e21] border text-[#9B9999] border-[#3a1a0e] md:text-2xl text-xl font-machina font-light leading-none pt-1.5 inline-block">
            <h1> Courses</h1>
          </CornerDotsBox>

          {/* Heading */}
          <div className="sm:max-w-[85%]">
            <div className="text-center mx-auto mt-5 mb-14 text-[2.3rem] md:text-[3.5rem] capitalize leading-[1.3] md:leading-18 w-[90%] md:w-[95%] lg:w-[72%] font-manrope font-medium">
              Level Up Your Coding Skills with{" "}
              <span className="text-(--custom-accentColor)">
                Expert-Led Courses
              </span>
            </div>
          </div>

          {/* Course Grid */}
          <div
            id="AllCourses"
            className="
    grid w-full mt-10 gap-12
    grid-cols-1
    md:grid-cols-2
    lg:grid-cols-3
  "
          >
            {coursesLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))
            ) : courses.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="size-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No courses found</h2>
                <p className="text-muted-foreground">
                  Check back later for new courses
                </p>
              </div>
            ) : (
              courses.map((course: ICourse) => (
                <CourseCard key={course._id} course={course} />
              ))
            )}
          </div>
        </section>
      </motion.div>
    </motion.main>
  );
}

export default CoursesTopSection;
