import DashBoardPage from "@/components/pages/dashboards/admin/DashBoardPage";
import RoleGate from "@/Providers/RoleGate";
import APP_info from "@/constants/app_info";
import { user_roles } from "@/constants/roles";


export const metadata = {
    title: `Admin Dashboard | ${APP_info.NAME}`,
    description: "Admin dashboard for managing the application.",
};


export default function Page() {
    return (
        <RoleGate allowed={[user_roles.ADMIN, user_roles.STUDENT, user_roles.INSTRUCTOR]}>
            <DashBoardPage />
        </RoleGate>
    );
}
