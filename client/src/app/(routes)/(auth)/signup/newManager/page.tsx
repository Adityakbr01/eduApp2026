import ManagerSignUpPage from "@/components/pages/Auth/ManagerSignUpPage";
import APP_INFO from "@/lib/CONSTANTS/APP_INFO";

export const metadata = {
    title: `MANAGER Sign Up | ${APP_INFO.NAME}`,
    description: "Create your MANAGER account."
};

export default function Page() {
    return <ManagerSignUpPage />;
}
