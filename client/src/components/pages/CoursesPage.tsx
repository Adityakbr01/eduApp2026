"use client";
import { Suspense } from "react";
import CoursesPageFallback from "./course/CoursesPageFallback";
import CoursesTopSection from "./Sections/CoursesSections/CoursesTopSection";
import HeroComparisonSection from "./Sections/HeroSections/HeroComparisonSection";
import HeroFaqSection from "./Sections/HeroSections/HeroFaqSection";
import Footer from "../Layouts/Footer";

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
