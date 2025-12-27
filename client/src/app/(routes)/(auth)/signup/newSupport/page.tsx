import SupportSignUpPage from "@/components/pages/Auth/SupportSignUpPage";
import APP_INFO from "@/lib/constants/APP_INFO";

export const metadata = {
    title: `SUPPORT TEAM Sign Up | ${APP_INFO.NAME}`,
    description: "Create your SUPPORT TEAM account."
};

export default function Page() {
    return <SupportSignUpPage />;
}
