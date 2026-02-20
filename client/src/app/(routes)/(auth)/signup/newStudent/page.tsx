import StudentSignUpPage from "@/features/auth/Pages/studentSignUpPage";
import APP_info from "@/constants/app_info";

export const metadata = {
  title: `Student Sign Up | ${APP_info.NAME}`,
  description: "Create your student account.",
};

export default function Page() {
  return <StudentSignUpPage />;
}
