import ManagerSignUpPage from "@/components/pages/Auth/ManagerSignUpPage";
import APP_INFO from "@/lib/constants/app_info";

export const metadata = {
    title: `MANAGER Sign Up | ${APP_INFO.NAME}`,
    description: "Create your MANAGER account."
};

export default function Page() {
    return <ManagerSignUpPage />;
}
