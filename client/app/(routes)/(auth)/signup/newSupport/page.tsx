import SupportSignUpPage from "@/components/pages/supportSignUpPage";
import APP_info from "@/constants/app_info";

export const metadata = {
    title: `SUPPORT TEAM Sign Up | ${APP_info.NAME}`,
    description: "Create your SUPPORT TEAM account."
};

export default function Page() {
    return <SupportSignUpPage />;
}
