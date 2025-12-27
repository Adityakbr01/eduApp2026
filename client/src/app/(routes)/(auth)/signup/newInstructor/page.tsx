import InstructorSignUpPage from "@/components/pages/Auth/InstructorSignUpPage";
import APP_INFO from "@/lib/constants/app_info";

export const metadata = {
    title: `INSTRUCTOR Sign Up | ${APP_INFO.NAME}`,
    description: "Create your INSTRUCTOR account."
};


export default function Page() {
    return <InstructorSignUpPage />;
}
