import ManagerSignUpPage from "@/features/auth/Pages/managerSignUpPage";
import APP_info from "@/constants/app_info";

export const metadata = {
  title: `MANAGER Sign Up | ${APP_info.NAME}`,
  description: "Create your MANAGER account.",
};

export default function Page() {
  return <ManagerSignUpPage />;
}
