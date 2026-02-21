"use client";
import { Suspense } from "react";
import Footer from "../../../components/Layouts/Footer";
import HeroComparisonSection from "../../home/Sections/HeroComparisonSection";
import HeroFaqSection from "../../home/Sections/HeroFaqSection";
import CoursesPageFallback from "../../course/components/CoursesPageFallback";
import CoursesTopSection from "../CoursesSections/CoursesTopSection";

export function CoursesPage() {
  return (
    <Suspense fallback={<CoursesPageFallback />}>
      <CoursesTopSection />
      <HeroComparisonSection />
      <HeroFaqSection />
      <Footer />
    </Suspense>
  );
}
