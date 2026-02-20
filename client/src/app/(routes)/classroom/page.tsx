import ClassroomPage from "@/features/classroom/Pages/ClassroomPage";
import APP_info from "@/constants/app_info";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Classroom | ${APP_info.NAME}`,
  description: "Access your classroom to learn and grow.",
};

function page() {
  return <ClassroomPage />;
}

export default page;
