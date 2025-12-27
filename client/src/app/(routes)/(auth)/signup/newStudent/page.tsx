import StudentSignUpPage from "@/components/pages/Auth/StudentSignUpPage";
import APP_info from "@/lib/constants/app_info";;

export const metadata = {
    title: `Student Sign Up | ${APP_info.NAME}`,
    description: "Create your student account."
};


export default function Page() {
    return <StudentSignUpPage />;
}
