import APP_info from "@/constants/app_info";
import { CoursesPage } from "@/features/course";

export const metadata = {
  title: `Explore Courses | ${APP_info.NAME}`,
  description: "Browse and discover courses to enhance your skills",
};

export default function Page() {
  return <CoursesPage />;
}
