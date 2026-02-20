"use client";

import { Button } from "@/components/ui/button";
import { STORAGE_KEYS } from "@/lib/constants/storage";
import { secureLocalStorage } from "@/lib/utils/encryption";
import { useLogout } from "@/services/auth/mutations";
import {
  CourseStatus,
  useDeleteCourse,
  useGetInstructorCourses,
  useSubmitCourseRequest,
} from "@/services/courses";
import { useEffect, useMemo, useState } from "react";
import { CoursesSection } from "./CoursesSection";
import { InstructorHeader } from "./InstructorHeader";
import { InstructorOverview } from "./InstructorOverview";
import { InstructorSidebar } from "./InstructorSidebar";
import {
  calculateStats,
  getDefaultStats,
  getRecentCourses,
  instructorSidebarItems,
  InstructorSidebarValue,
} from "./utils";
import GradingPage from "@/components/pages/dashboards/instructor/grading/page";
import { NotificationsSection } from "./NotificationsSection";

export function InstructorDashboard() {
  const logout = useLogout();
  const { data, isLoading, error } = useGetInstructorCourses();

  const submitCourseRequest = useSubmitCourseRequest();
  const deleteCourse = useDeleteCourse();

  // 🔹 NEW: Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [activeSection, setActiveSection] = useState<InstructorSidebarValue>(
    () => {
      if (typeof window === "undefined") {
        return "overview";
      }

      const savedSection = secureLocalStorage.getItem<InstructorSidebarValue>(
        STORAGE_KEYS.INSTRUCTOR_LAST_ACTIVE_SECTION_KEY,
      );

      const foundItem = instructorSidebarItems.find(
        (item) => item.value === savedSection,
      );

      return foundItem ? foundItem.value : "overview";
    },
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const courses = useMemo(
    () => data?.data?.courses || [],
    [data?.data?.courses],
  );

  const stats = useMemo(
    () => (courses.length > 0 ? calculateStats(courses) : getDefaultStats()),
    [courses],
  );

  const recentCourses = useMemo(() => getRecentCourses(courses, 5), [courses]);

  const activeSectionItem = useMemo(
    () =>
      instructorSidebarItems.find((item) => item.value === activeSection) ||
      instructorSidebarItems[0],
    [activeSection],
  );

  const submitCourseRequestHandler = (
    id: string,
    status: CourseStatus.PUBLISHED | CourseStatus.UNPUBLISHED,
  ) => {
    submitCourseRequest.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      deleteCourse.mutate(id);
    }
  };

  const handleLogout = () => logout.mutate();

  // 🔹 Save active section to secure storage whenever it changes
  useEffect(() => {
    secureLocalStorage.setItem(
      STORAGE_KEYS.INSTRUCTOR_LAST_ACTIVE_SECTION_KEY,
      activeSection,
    );
  }, [activeSection]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load dashboard</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 flex h-screen overflow-hidden">
      {/* Sidebar */}
      <InstructorSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <InstructorHeader
          sectionTitle={activeSectionItem.label}
          activeSection={activeSection}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {activeSection === "overview" && (
            <InstructorOverview
              stats={stats}
              recentCourses={recentCourses}
              isLoading={isLoading}
              onViewAllCourses={() => setActiveSection("courses")}
            />
          )}

          {activeSection === "courses" && (
            <CoursesSection
              courses={courses}
              isLoading={isLoading}
              searchQuery={searchQuery}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              submitCourseRequest={submitCourseRequestHandler}
              onDelete={handleDelete}
            />
          )}

          {activeSection === "grading" && <GradingPage />}

          {activeSection === "notifications" && (
            <NotificationsSection courses={courses} />
          )}
        </div>
      </main>
    </div>
  );
}
