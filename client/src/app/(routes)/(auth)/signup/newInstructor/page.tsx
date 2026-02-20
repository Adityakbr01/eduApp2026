import InstructorSignUpPage from "@/features/auth/Pages/instructorsignuppage";
import APP_info from "@/constants/app_info";

export const metadata = {
  title: `INSTRUCTOR Sign Up | ${APP_info.NAME}`,
  description: "Create your INSTRUCTOR account.",
};

export default function Page() {
  return <InstructorSignUpPage />;
}
