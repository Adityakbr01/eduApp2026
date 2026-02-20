import APP_info from "@/constants/app_info";
import { user_roles } from "@/constants/roles";
import RoleGate from "@/providers/RoleGate";
import EditCourseClient from "./EditCourseClient";

export const metadata = {
    title: `Edit Course | ${APP_info.NAME}`,
    description: "Edit your course details",
};

export default function EditCoursePage() {
    return (
        <RoleGate allowed={[user_roles.INSTRUCTOR]}>
            <EditCourseClient />
        </RoleGate>
    );
}
