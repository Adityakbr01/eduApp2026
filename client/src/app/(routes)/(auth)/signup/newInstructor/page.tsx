import InstructorSignUpPage from "@/components/pages/Auth/instructorsignuppage";
import APP_info from "@/lib/constants/app_info";;

export const metadata = {
    title: `INSTRUCTOR Sign Up | ${APP_info.NAME}`,
    description: "Create your INSTRUCTOR account."
};


export default function Page() {
    return <InstructorSignUpPage />;
}
