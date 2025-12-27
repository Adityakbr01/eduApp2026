import StudentSignUpPage from "@/components/pages/Auth/StudentSignUpPage";
import APP_INFO from "@/lib/CONSTANTS/APP_INFO";

export const metadata = {
    title: `Student Sign Up | ${APP_INFO.NAME}`,
    description: "Create your student account."
};


export default function Page() {
    return <StudentSignUpPage />;
}
