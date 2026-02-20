import APP_info from "@/constants/app_info";
import { user_roles } from "@/constants/roles";
import RoleGate from "@/providers/RoleGate";
import { CourseForm } from "@/components/pages/dashboards/instructor/courses/CourseFormComp/CourseForm";

export const metadata = {
    title: `Create Course | ${APP_info.NAME}`,
    description: "Create a new course",
};

export default function CreateCoursePage() {
    return (
        <RoleGate allowed={[user_roles.INSTRUCTOR]}>
            <div className="container py-6 max-w-6xl mx-auto">
                <CourseForm />
            </div>
        </RoleGate>
    );
}
