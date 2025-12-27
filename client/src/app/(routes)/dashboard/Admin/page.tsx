import DashBoardPage from "@/components/pages/dashboard/admin/DashBoardPage";
import RoleGate from "@/components/pages/dashboard/RoleGate";
import APP_info from "@/lib/constants/app_info";;
import { ROLES } from "@/validators/auth.schema";

export const metadata = {
    title: `Admin Dashboard | ${APP_info.NAME}`,
    description: "Admin dashboard for managing the application.",
};


export default function Page() {
    return (
        <RoleGate allowed={[ROLES.ADMIN, ROLES.MANAGER]}>
            <DashBoardPage />
        </RoleGate>
    );
}
