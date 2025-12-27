import ManagerSignUpPage from "@/components/pages/Auth/managerSignUpPage";
import APP_info from "@/lib/constants/app_info";;

export const metadata = {
    title: `MANAGER Sign Up | ${APP_info.NAME}`,
    description: "Create your MANAGER account."
};

export default function Page() {
    return <ManagerSignUpPage />;
}
