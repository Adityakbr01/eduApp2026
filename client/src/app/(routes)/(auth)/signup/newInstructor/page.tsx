import InstructorSignUpPage from "@/components/pages/Auth/InstructorSignUpPage";
import APP_INFO from "@/lib/constants/APP_INFO";

export const metadata = {
    title: `INSTRUCTOR Sign Up | ${APP_INFO.NAME}`,
    description: "Create your INSTRUCTOR account."
};


export default function Page() {
    return <InstructorSignUpPage />;
}
